#ifndef HUFFMAN_H
#define HUFFMAN_H

#include <string>
using namespace std;

void compress_file(string input_path, string output_path);
void decompress_file(string input_path, string output_path);

#endif