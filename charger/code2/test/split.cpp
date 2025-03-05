#include<iostream>
using namespace std;

union ID{
    struct{
       unsigned int desBoard : 3 ;
       unsigned int desPost :  2 ;
       unsigned int desType :  3 ;
       unsigned int srcBoard : 3 ;
       unsigned int srcPost :  2 ;
       unsigned int srcType :  3 ;
       unsigned int cmd :      8 ;
       unsigned int err :      3 ;
       unsigned int cmdType :  2 ;
       unsigned int unalloc :  3 ;
    } bits;
    uint32_t canId;
};

union Data{
    uint8_t bytes[8];
    uint64_t canData;
};

int main(){
    union ID id;

    id.canId = 2282037344 & 0x1FFFFFFF;
    printf("desBoard : %08x\n", id.canId);

    printf("desBoard : %u\n", id.bits.desBoard);
    printf("desPost  : %u\n", id.bits.desPost);
    printf("desType  : %u\n", id.bits.desType);
    printf("srcBoard : %u\n", id.bits.srcBoard);
    printf("srcPost  : %u\n", id.bits.srcPost);
    printf("srcType  : %u\n", id.bits.srcType);
    printf("cmd      : %u\n", id.bits.cmd);
    printf("err      : %u\n", id.bits.err);
    printf("cmdType  : %u\n", id.bits.cmdType);
    printf("unalloc  : %u\n", id.bits.unalloc);

    union Data readData;
    readData.canData = 0x1122334455667788;
    printf("data1 : %02x\n", readData.bytes[0]);
    printf("data2 : %02x\n", readData.bytes[1]);
    printf("data3 : %02x\n", readData.bytes[2]);
    printf("data4 : %02x\n", readData.bytes[3]);
    printf("data5 : %02x\n", readData.bytes[4]);
    printf("data6 : %02x\n", readData.bytes[5]);
    printf("data7 : %02x\n", readData.bytes[6]);
    printf("data8 : %02x\n", readData.bytes[7]);

    return 0;
}