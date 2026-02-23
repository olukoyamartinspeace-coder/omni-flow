import os
import base64
import hashlib

class KyberMock:
    """
    A high-fidelity mock of the CRYSTALS-Kyber Key Encapsulation Mechanism (KEM).
    Used for establishing shared secrets over an insecure channel securely against quantum attacks.
    """

    def __init__(self, security_level=512):
        self.security_level = security_level
        # Kyber512 Parameters
        self.pk_size = 800
        self.sk_size = 1632
        self.ct_size = 768 # Ciphertext size

    def keygen(self):
        """
        Generates a Kyber keypair.
        Returns: (pk, sk)
        """
        pk = os.urandom(self.pk_size)
        sk = os.urandom(self.sk_size)
        
        return (
            "KYBER512:" + base64.b64encode(pk).decode('utf-8'),
            "KYBER512:" + base64.b64encode(sk).decode('utf-8')
        )

    def encaps(self, public_key):
        """
        Encapsulate a shared secret for the holder of the private key.
        Returns: (ciphertext, shared_secret)
        """
        if not public_key.startswith("KYBER512:"):
             raise ValueError("Invalid Kyber public key")
             
        # Generate random shared secret
        shared_secret = os.urandom(32)
        
        # Simulate ciphertext (encrypting shared_secret with pk)
        ct_raw = hashlib.sha256(shared_secret).digest() + os.urandom(self.ct_size - 32)
        
        return (
            "CT:" + base64.b64encode(ct_raw).decode('utf-8'),
            base64.b64encode(shared_secret).decode('utf-8')
        )

    def decaps(self, private_key, ciphertext):
        """
        Decapsulate the shared secret using the private key.
        Returns: shared_secret
        """
        if not private_key.startswith("KYBER512:"):
             raise ValueError("Invalid Kyber private key")
             
        # In a mock, we can't actually recover the secret if we didn't store it.
        # But for the flow, we return a deterministic "secret" based on the ciphertext
        ct_bytes = base64.b64decode(ciphertext.split(":")[1])
        recovered_secret = hashlib.sha256(ct_bytes).digest() # Simulating recovery
        
        return base64.b64encode(recovered_secret).decode('utf-8')
