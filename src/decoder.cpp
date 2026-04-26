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

void decompress_file(string input_path, string output_path){
    
    ifstream in(input_path, ios::binary);
    ofstream out(output_path, ios::binary);

    if (!in.is_open() || !out.is_open()) {
        cerr << "File open failed\n";
        return;
    }

    // Read padding bits
    unsigned char padding_bits;
    in.read((char*)&padding_bits, 1);

    // Read unique count
    unsigned short unique_count;
    in.read((char*)&unique_count, sizeof(unique_count));

    // Read frequency table
    vector<long long> freq(256, 0);
    for (int i = 0; i < unique_count; i++) {
        unsigned char b;
        long long f;
        in.read((char*)&b, 1);
        in.read((char*)&f, sizeof(f));
        freq[b] = f;
    }

    // Rebuild Huffman Tree
    priority_queue<Node*, vector<Node*>, Compare> pq;
    for (int i = 0; i < 256; i++) {
        if (freq[i] > 0) {
            pq.push(new Node(i, freq[i]));
        }
    }

    while (pq.size() > 1) {
        Node* a = pq.top(); pq.pop();
        Node* b = pq.top(); pq.pop();
        Node* parent = new Node(-1, a->freq + b->freq);
        parent->left = a;
        parent->right = b;
        pq.push(parent);
    }

    Node* root = pq.top();
    Node* curr = root;

    // Decode bitstream
    unsigned char byte;
    vector<int> bits;

    while (in.read((char*)&byte, 1)) {
        for (int i = 7; i >= 0; i--) {
            bits.push_back((byte >> i) & 1);
        }
    }

    // Remove padding bits
    for (int i = 0; i < padding_bits; i++) {
        bits.pop_back();
    }

    // Traverse tree
    for (int bit : bits) {
        if (bit == 0)
            curr = curr->left;
        else
            curr = curr->right;

        if (curr->left == NULL && curr->right == NULL) {
            out.write((char*)&curr->byte, 1);
            curr = root;
        }
    }

    cout << "Decompression complete\n";

}


