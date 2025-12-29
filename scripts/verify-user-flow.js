const BASE_URL = 'http://localhost:3000/api';

async function main() {
  const timestamp = Date.now();
  const phone = `138${timestamp.toString().slice(-8)}`;
  const password = 'password123';
  const code = '123456'; // Assuming default code or mock

  console.log(`Starting verification for user: ${phone}`);

  // 1. Register
  console.log('\n1. Registering...');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, code }),
  });
  const regData = await regRes.json();
  console.log('Register Status:', regRes.status);
  console.log('Register Response:', regData);

  if (regRes.status !== 200 && regRes.status !== 201) {
    console.error('Registration failed');
    return;
  }

  // 2. Login
  console.log('\n2. Logging in...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', loginData);

  if (!loginData.data || !loginData.data.token) {
    console.error('Login failed, no token received');
    return;
  }

  const token = loginData.data.token;
  console.log('Token received:', token.substring(0, 20) + '...');

  // 3. Get User Profile (Verify Middleware)
  console.log('\n3. Getting User Profile...');
  const meRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const meData = await meRes.json();
  console.log('Get Me Status:', meRes.status);
  console.log('Get Me Response:', meData);

  if (meRes.status !== 200) {
    console.error('Get Profile failed');
    return;
  }

  // 4. Update User Profile
  console.log('\n4. Updating User Profile...');
  const updateRes = await fetch(`${BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nickname: `User_${timestamp}` }),
  });
  const updateData = await updateRes.json();
  console.log('Update Status:', updateRes.status);
  console.log('Update Response:', updateData);

  if (updateRes.status !== 200) {
    console.error('Update Profile failed');
    return;
  }

  console.log('\n✅ Verification Successful!');
}

main().catch(console.error);
