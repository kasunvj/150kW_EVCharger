#include<iostream>
using namespace std;

#define N 10

int buffer [N]= {};
int writeIndex = 0; 
int readIndex = 0;

void printBuff(){
    for(int i=0; i<N ;i++){
        cout << buffer[i] << " ";
    }
    cout << endl;
}

void put(int val){
    buffer[writeIndex] = val;
    if(writeIndex >= N){
        writeIndex = 0;
    }else{
        writeIndex++;
    }
    printBuff();
}

int get(){
    int val = buffer[readIndex];
    if(readIndex >= N){
        readIndex = 0;
    }else{
        readIndex++;
    }
    printBuff();
    cout << "Value :" << val << endl;
    return val;
    
}


int main(){
cout << (6 + 1)%N << endl ;

//initialize
for(int i=0; i<N ;i++){
    buffer[i] = 0;
}    

put(1);
put(2);
put(3);

get();
get();

put(4);




return 0; 
}