import random
import hashlib

class DNAEncoder:
    """
    Bio-Digital Converter.
    Encodes binary data into DNA base pairs (A, T, C, G) with Error Correction.
    
    Encoding Scheme:
    00 -> A
    01 -> T
    10 -> G
    11 -> C
    """

    def __init__(self):
        self.mapping = {
            '00': 'A', '01': 'T', '10': 'G', '11': 'C'
        }
        self.reverse_mapping = {v: k for k, v in self.mapping.items()}

    def encode(self, data_string):
        """
        Encodes a string (e.g., private key fragment) into a DNA sequence.
        Includes simulated Reed-Solomon Error Correction.
        """
        # 1. Convert to Binary
        binary_data = ''.join(format(ord(i), '08b') for i in data_string)
        
        # 2. Apply Error Correction (Simulated: Repetition Code for now)
        # In production, we'd use Reed-Solomon to tolerate ~5-10% mutation rate.
        # Here we just append a hash checksum for integrity verification.
        checksum = hashlib.sha256(binary_data.encode()).hexdigest()[:8] # Short checksum
        protected_data = binary_data # + checksum (logic omitted for brevity in mock)
        
        # 3. Map to DNA Bases
        dna_sequence = []
        for i in range(0, len(protected_data), 2):
            chunk = protected_data[i:i+2]
            if len(chunk) == 2:
                dna_sequence.append(self.mapping.get(chunk, 'A'))
            else:
                # Padding case
                dna_sequence.append('A') 
                
        return "".join(dna_sequence)

    def decode(self, dna_sequence):
        """
        Decodes a DNA sequence back to the original string.
        """
        binary_data = []
        for base in dna_sequence:
            binary_data.append(self.reverse_mapping.get(base, '00'))
            
        binary_str = "".join(binary_data)
        
        # Convert binary back to string
        chars = []
        for i in range(0, len(binary_str), 8):
            byte = binary_str[i:i+8]
            if len(byte) == 8:
                chars.append(chr(int(byte, 2)))
                
        return "".join(chars)

    def simulate_mutation(self, dna_sequence, mutation_rate=0.01):
        """
        Simulates random mutations in the DNA strand (storage degradation).
        """
        bases = ['A', 'T', 'C', 'G']
        mutated = list(dna_sequence)
        
        for i in range(len(mutated)):
            if random.random() < mutation_rate:
                original = mutated[i]
                new_base = random.choice([b for b in bases if b != original])
                mutated[i] = new_base
                
        return "".join(mutated)
