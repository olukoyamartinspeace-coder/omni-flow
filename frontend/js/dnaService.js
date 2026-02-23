/**
 * DNAService
 * Handles encoding and decoding of binary data into DNA sequences (A, C, G, T).
 * Includes simulated Reed-Solomon error correction.
 */
class DNAService {
    constructor() {
        this.DNA_MAP = {
            '00': 'A',
            '01': 'C',
            '10': 'G',
            '11': 'T'
        };
        this.REVERSE_DNA_MAP = {
            'A': '00',
            'C': '01',
            'G': '10',
            'T': '11'
        };
    }

    /**
     * Encode binary string (hex) into DNA sequence
     */
    encode(hexData) {
        // 1. Convert hex to binary
        let binary = '';
        for (let i = 0; i < hexData.length; i++) {
            const bin = parseInt(hexData[i], 16).toString(2).padStart(4, '0');
            binary += bin;
        }

        // 2. Add Reed-Solomon style parity (Simulated as simple checksum for demo)
        const parity = this.calculateParity(binary);
        const dataWithParity = binary + parity;

        // 3. Map binary pairs to DNA bases
        let dna = '';
        for (let i = 0; i < dataWithParity.length; i += 2) {
            const pair = dataWithParity.substring(i, i + 2);
            dna += this.DNA_MAP[pair] || 'A';
        }

        return dna;
    }

    /**
     * Decode DNA sequence back to binary (hex)
     */
    decode(dnaSequence) {
        // 1. Map DNA bases to binary pairs
        let binary = '';
        for (let i = 0; i < dnaSequence.length; i++) {
            binary += this.REVERSE_DNA_MAP[dnaSequence[i]];
        }

        // 2. Separate data and parity
        const dataLength = binary.length - 16; // 16 bits of parity
        const dataBin = binary.substring(0, dataLength);
        const parityBin = binary.substring(dataLength);

        // 3. Verify parity
        const expectedParity = this.calculateParity(dataBin);
        if (expectedParity !== parityBin) {
            console.warn('DNA Checksum mismatch! Error detected.');
            // In real RS, we would correct errors here
        }

        // 4. Convert binary to hex
        let hex = '';
        for (let i = 0; i < dataBin.length; i += 4) {
            hex += parseInt(dataBin.substring(i, i + 4), 2).toString(16);
        }

        return hex;
    }

    /**
     * Calculate a simple 16-bit parity for demo purposes
     */
    calculateParity(binary) {
        let checksum = 0;
        for (let i = 0; i < binary.length; i += 8) {
            const byte = parseInt(binary.substring(i, i + 8), 2) || 0;
            checksum ^= byte;
        }
        return checksum.toString(2).padStart(16, '0');
    }

    /**
     * Format DNA sequence for display (chunks of 10)
     */
    formatDNA(dna) {
        return dna.match(/.{1,10}/g).join(' ');
    }
}

window.dnaService = new DNAService();
