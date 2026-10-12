async function testGameLaunch() {
  const resellerId = Number(process.env.GAMECLOUD_RESELLER_ID);
  const apiToken = process.env.GAMECLOUD_API_TOKEN;
  const secretKey = process.env.GAMECLOUD_SECRET_KEY;
  const gatewayUrl = process.env.GAMECLOUD_BASE_URL || 'https://api.gamecloudapi.com';

  if (!Number.isInteger(resellerId) || resellerId <= 0 || !apiToken || !secretKey) {
    throw new Error(
      'Set GAMECLOUD_RESELLER_ID, GAMECLOUD_API_TOKEN, and GAMECLOUD_SECRET_KEY in the shell environment.'
    );
  }

  const launchUrl = `${gatewayUrl}/api/v1/game/launch`;
  const payload = {
    reseller_id: resellerId,
    player_id: 'player_test_001',
    game_uid: process.argv[2] || 'spribe_aviator',
    mode: 'seamless',
    currency_code: 'INR',
    home_url: 'https://maltiplayx.com',
  };

  const response = await fetch(launchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://maltiplayx.com',
      Referer: 'https://maltiplayx.com/',
      'X-API-Token': apiToken,
      'X-Secret-Key': secretKey,
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    data = { message: 'Provider returned a non-JSON response.' };
  }

  console.log(`Provider HTTP status: ${response.status}`);
  console.log(`Provider status: ${data?.status || 'UNKNOWN'}`);
  if (!response.ok || data?.status !== 'SUCCESS') {
    console.error('Provider error:', data?.error || data?.message || 'No provider error message.');
  }
}

testGameLaunch().catch((error) => {
  console.error('GameCloud launch test failed:', error.message);
  process.exitCode = 1;
});
