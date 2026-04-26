#include <bits/stdc++.h>
using namespace std;

class Node {
public:
    int byte;
    long long freq;
    Node* left;
    Node* right;

    Node(int b, long long f) {
        byte = b;
        freq = f;
        left = right = NULL;
    }
};

struct Compare {
    bool operator()(Node* a, Node* b) {
        return a->freq > b->freq;
    }
};

void generate_codes(Node* root, string code, unordered_map<int,string>& codes) {
    if (!root->left && !root->right) {
        if (code == "") code = "0"; // single-byte file case
        codes[root->byte] = code;
        return;
    }
    generate_codes(root->left, code + "0", codes);
    generate_codes(root->right, code + "1", codes);
}

void compress_file(string input_path , string output_path){

    ifstream in(input_path, ios::binary);
    ofstream out(output_path, ios::binary);

    if (!in.is_open() || !out.is_open()) {
        cerr << "File open failed\n";
        return;
    }

    // Step 1: Frequency counting
    vector<long long> freq(256, 0);
    unsigned char byte;

    while (in.read((char*)&byte, 1)) {
        freq[byte]++;
    }

    // Step 2: Build min-heap
    priority_queue<Node*, vector<Node*>, Compare> pq;
    for (int i = 0; i < 256; i++) {
        if (freq[i] > 0) {
            pq.push(new Node(i, freq[i]));
        }
    }

    // Step 3: Build Huffman tree
    while (pq.size() > 1) {
        Node* a = pq.top(); pq.pop();
        Node* b = pq.top(); pq.pop();
        Node* parent = new Node(-1, a->freq + b->freq);
        parent->left = a;
        parent->right = b;
        pq.push(parent);
    }

    Node* root = pq.top();

    // Step 4: Generate Huffman codes
    unordered_map<int,string> codes;
    generate_codes(root, "", codes);

    // Step 5/7: Write header
    unsigned char padding_bits = 0;
    unsigned short unique_count = 0;

    for (int i = 0; i < 256; i++)
        if (freq[i] > 0) unique_count++;

    out.write((char*)&padding_bits, 1);
    out.write((char*)&unique_count, sizeof(unique_count));

    for (int i = 0; i < 256; i++) {
        if (freq[i] > 0) {
            unsigned char b = i;
            out.write((char*)&b, 1);
            out.write((char*)&freq[i], sizeof(freq[i]));
        }
    }

    // Step 9: Streaming Huffman encoding (REAL encoder)
    in.clear();
    in.seekg(0);

    unsigned char buffer = 0;
    int bits_filled = 0;

    while (in.read((char*)&byte, 1)) {
        string& code = codes[byte];

        for (char c : code) {
            buffer = (buffer << 1) | (c - '0');
            bits_filled++;

            if (bits_filled == 8) {
                out.write((char*)&buffer, 1);
                buffer = 0;
                bits_filled = 0;
            }
        }
    }

    // Handle padding
    if (bits_filled > 0) {
        padding_bits = 8 - bits_filled;
        buffer <<= padding_bits;
        out.write((char*)&buffer, 1);
    }

    // Patch padding bits at file start
    out.seekp(0);
    out.write((char*)&padding_bits, 1);

    cout << "Compression complete\n";

}

