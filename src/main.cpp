#include <bits/stdc++.h>
#include "huffman.h"
using namespace std;



int main(int argc, char* argv[]){
    if(argc < 4){
        cout<< "Usage: \n";
        cout<<"./huffman compress input output\n";
        cout<<"./hufman decompress input output\n";

        return 1;
    }

    string mode = argv[1];
    string input = argv[2];
    string output = argv[3];

    if(mode == "compress"){
        compress_file(input,output);
    }
    else if(mode == "decompress"){
        decompress_file(input,output);
    }
    else{
        cout<<"Invalid mode\n";
    }

    return 0;
}