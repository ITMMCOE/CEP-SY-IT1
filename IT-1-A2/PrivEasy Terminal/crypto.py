import os
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
import hashlib

SALT_SIZE = 16
KEY_SIZE = 32
ITERATIONS = 100_000
BLOCK_SIZE = AES.block_size

def pad(data: bytes) -> bytes:
    padding_length = BLOCK_SIZE - (len(data) % BLOCK_SIZE)
    return data + bytes([padding_length]) * padding_length

def unpad(data: bytes) -> bytes:
    padding_length = data[-1]
    return data[:-padding_length]

def derive_key(password: str, salt: bytes) -> bytes:
    return PBKDF2(password, salt, dkLen=KEY_SIZE, count=ITERATIONS)

def calculate_file_hash(file_path: str) -> str:
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        while chunk := f.read(4096):
            hasher.update(chunk)
    return hasher.hexdigest()

def encrypt_file(password: str = None, in_file: str = None, out_file: str = None, session_key: bytes = None):
    if out_file is None:
        out_file = in_file + ".enc"

    salt = os.urandom(SALT_SIZE)
    iv = os.urandom(BLOCK_SIZE)

    if session_key is None:
        if password is None:
            raise ValueError("Either password or session_key must be provided")
        key = derive_key(password, salt)
    else:
        key = session_key

    cipher = AES.new(key, AES.MODE_CBC, iv)

    with open(in_file, "rb") as f:
        plaintext = f.read()

    ciphertext = cipher.encrypt(pad(plaintext))

    with open(out_file, "wb") as f:
        f.write(salt + iv + ciphertext)

    return out_file

def decrypt_file(password: str = None, in_file: str = None, out_file: str = None, session_key: bytes = None):
    if not in_file.endswith(".enc"):
        raise ValueError("Invalid encrypted file extension")

    if out_file is None:
        out_file = in_file[:-4]

    with open(in_file, "rb") as f:
        file_data = f.read()

    salt = file_data[:SALT_SIZE]
    iv = file_data[SALT_SIZE:SALT_SIZE + BLOCK_SIZE]
    ciphertext = file_data[SALT_SIZE + BLOCK_SIZE:]

    if session_key is None:
        if password is None:
            raise ValueError("Either password or session_key must be provided")
        key = derive_key(password, salt)
    else:
        key = session_key

    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = unpad(cipher.decrypt(ciphertext))

    with open(out_file, "wb") as f:
        f.write(plaintext)

    return out_file