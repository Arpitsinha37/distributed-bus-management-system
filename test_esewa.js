async function test() {
  const fakeEsewaData = {
    transaction_code: "123",
    status: "COMPLETE",
    total_amount: "1600",
    transaction_uuid: "NRT-1234-5678",
    product_code: "NP-ES-NRTRAVEL",
    signed_field_names: "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names",
    signature: "fake"
  };
  const b64 = Buffer.from(JSON.stringify(fakeEsewaData)).toString('base64');
  console.log("Base64 Data:", b64);
  try {
    const res = await fetch('https://backend-api-production-be2e.up.railway.app/api/v1/payments/esewa/webhook', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: b64 }) 
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}
test();
