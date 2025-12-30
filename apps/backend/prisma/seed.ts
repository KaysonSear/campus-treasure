import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['query'],
});

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Clean existing data
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.order.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned database');

  // 2. Create Users
  const passwordHash = await bcrypt.hash('123456', 10);

  const usersData = Array.from({ length: 5 }).map((_, i) => ({
    phone: `1380013800${i}`,
    passwordHash,
    nickname: `Student${i + 1}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Student${i + 1}`,
    school: i % 2 === 0 ? '清华大学' : '北京大学',
  }));

  const users = await Promise.all(usersData.map((data) => prisma.user.create({ data })));

  console.log(`👤 Created ${users.length} users`);

  // 3. Create Items
  const categories = ['Electronics', 'Books', 'Clothing', 'Sports', 'Other'];
  const titles = [
    'iPhone 13 99新',
    '考研数学复习全书',
    '耐克篮球鞋',
    '折叠自行车',
    'JBL蓝牙音箱',
    'iPad Pro 2021',
    'C++ Primer Plus',
    '阿迪达斯运动裤',
    '尤尼克斯羽毛球拍',
    '罗技机械键盘',
  ];

  const itemsData = [];
  for (let i = 0; i < 20; i++) {
    const seller = users[Math.floor(Math.random() * users.length)];
    if (!seller) continue;

    const titleIndex = i % titles.length;
    const titleSuffix = Math.floor(i / titles.length) + 1;
    const titleBase = titles[titleIndex] ?? 'Item';
    const title = titleBase + titleSuffix;

    itemsData.push({
      title,
      description: `这是一件非常好的商品，成色很新，${title}，欢迎购买！`,
      price: Math.floor(Math.random() * 1000) + 50,
      images: [
        `https://picsum.photos/seed/${i}/400/400`,
        `https://picsum.photos/seed/${i + 100}/400/400`,
      ],
      condition: ['全新', '99新', '9成新', '8成新'][Math.floor(Math.random() * 4)] ?? '全新',
      category: categories[Math.floor(Math.random() * categories.length)] ?? 'Other',
      status: 'available',
      sellerId: seller.id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
    });
  }

  await prisma.item.createMany({ data: itemsData });
  console.log(`📦 Created ${itemsData.length} items`);

  const allItems = await prisma.item.findMany();

  // 4. Create Favorites (Randomly)
  const favoritesData = [];
  for (const user of users) {
    const randomItems = allItems.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const item of randomItems) {
      if (!user.id || !item.id) continue;
      favoritesData.push({
        userId: user.id,
        itemId: item.id,
      });
    }
  }

  // Use createMany if supported for relations or simple link table logic,
  // but Favorites has @id, so createMany works if model structure allows.
  // SQLite/Postgres support createMany, MongoDB does too in recent versions.
  // However, prisma schema for mongodb ensures _id, so createMany is fine given `id` map.
  // Actually let's use loop to be safe or createMany with no relations?
  // Prisma `createMany` doesn't support relations, but here we provide IDs.
  await prisma.favorite.createMany({ data: favoritesData });
  console.log(`❤️ Created ${favoritesData.length} favorites`);

  // 5. Create Orders (Randomly)
  // Some items sold
  const itemsToSell = allItems.slice(0, 5);
  for (const item of itemsToSell) {
    const buyer = users.find((u) => u.id !== item.sellerId) || users[0];
    if (!buyer) continue;

    await prisma.order.create({
      data: {
        itemId: item.id,
        buyerId: buyer.id,
        amount: item.price,
        status: 'completed',
        createdAt: new Date(),
      },
    });

    // Update item status
    await prisma.item.update({
      where: { id: item.id },
      data: { status: 'sold' },
    });
  }
  console.log(`🛒 Created ${itemsToSell.length} orders`);

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
