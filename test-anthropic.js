
const KEY = "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";

async function check() {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet', // Simple model name to see if it works
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }]
      })
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}
check();
