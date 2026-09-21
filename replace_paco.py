import re

legacy_path = r'D:\New road travels\redbus-clone\cms-platform\apps\api\src\modules\payment\paco-gateway.service.ts'
new_path = r'd:\distributed bus management system\bus-booking-backend\src\payments\providers\paco.provider.ts'

with open(legacy_path, 'r', encoding='utf-8') as f:
    legacy_content = f.read()
    
with open(new_path, 'r', encoding='utf-8') as f:
    new_content = f.read()

def extract_val(prop_name):
    # Match something like: private readonly paymentEndpoint = process.env.PACO_ENDPOINT || 'https://core.demo-paco.2c2p.com/';
    pattern = r"private readonly " + prop_name + r"\s*=\s*process\.env\.[A-Z_0-9]+\s*\|\|\s*'([^']+)'"
    match = re.search(pattern, legacy_content)
    if match:
        return match.group(1)
    return None

def extract_val_key(key_name, env_name):
    # Match something like: NPR: process.env.PACO_API_KEY_NPR || process.env.PACO_API_KEY || '65805a1636c74b8e8ac81a991da80be4',
    pattern = key_name + r": process\.env\." + env_name + r"(?:\s*\|\|\s*process\.env\.[A-Z_0-9]+)?\s*\|\|\s*'([^']+)'"
    match = re.search(pattern, legacy_content)
    if match:
        return match.group(1)
    return None

def replace_val(prop_name, new_val):
    global new_content
    pattern = r"(private readonly " + prop_name + r"\s*=\s*process\.env\.[A-Z_0-9]+\s*\|\|\s*')[^']+'"
    new_content = re.sub(pattern, r"\g<1>" + new_val.replace('\\', '\\\\') + "'", new_content)

def replace_val_key(key_name, env_name, new_val):
    global new_content
    pattern = r"(" + key_name + r": process\.env\." + env_name + r"(?:\s*\|\|\s*process\.env\.[A-Z_0-9]+)?\s*\|\|\s*')[^']+'"
    new_content = re.sub(pattern, r"\g<1>" + new_val.replace('\\', '\\\\') + "'", new_content)

props = [
    'paymentEndpoint',
    'merchantId',
    'encryptionKeyId',
    'merchantSigningPrivateKeyB64',
    'pacoEncryptionPublicKeyB64',
    'pacoSigningPublicKeyB64',
    'merchantDecryptionPrivateKeyB64'
]

for p in props:
    v = extract_val(p)
    if v:
        replace_val(p, v)

v_npr = extract_val_key('NPR', 'PACO_API_KEY_NPR')
if v_npr:
    replace_val_key('NPR', 'PACO_API_KEY_NPR', v_npr)

v_usd = extract_val_key('USD', 'PACO_API_KEY_USD')
if v_usd:
    replace_val_key('USD', 'PACO_API_KEY_USD', v_usd)

with open(new_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Successfully replaced PACO keys")
