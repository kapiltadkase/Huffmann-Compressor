# Huffman File Compression Tool

This project is a **C++ command-line tool** that compresses and decompresses files using **Huffman coding**, a lossless data compression algorithm. It demonstrates important programming concepts like binary file handling, priority queues, tree structures, and bit-level operations.

---

## Features

- Compress any text or binary file using Huffman coding.  
- Stores a compact header with frequency table and padding information for exact decompression.  
- Supports round-trip lossless decompression.  
- Handles edge cases like files with a single unique byte or empty files.  
- Command-line interface for compressing (`-c`) and decompressing (`-d`) files.  
- Efficient bit-level packing to reduce file size.  

---

## How It Works

1. **Frequency Counting:** Count how many times each byte appears in the file.  
2. **Huffman Tree:** Build a tree using a min-heap where smaller frequency nodes are combined first.  
3. **Code Generation:** Traverse the tree recursively to assign unique prefix codes to each byte.  
4. **Encoding:** Replace each byte in the input file with its Huffman code.  
5. **Bit Packing:** Convert the string of bits into bytes for efficient storage.  
6. **Header Writing:** Save the original file size, padding bits, and frequency table for the decoder.  
7. **Decoding:** Read the header, rebuild the Huffman tree, and reconstruct the original file exactly.

---

