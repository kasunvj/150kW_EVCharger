//Charger data transfer protocol - Msg generator
//19.09.2024

#include<stdio.h>
#include<stdint.h>
#include <stdlib.h> 
struct CanId{
    uint8_t cmdType;
    uint8_t cmd;
    uint8_t sourceAddr;
    uint8_t destAddr;
};

void add(struct CanId *canid,int selection,int title){
    //printf("%d %d %d",msg,selection,titl

    switch(title){
        case 1:// 1st byte in CAN ID, contains Command type
            switch(selection){
                case 1: //Command type, reqest
                    canid->cmdType = 0b00;
                    break;
                case 2: //Command type, response
                    canid->cmdType = 0b01;
                    break;
                default:
                    printf("\033[1;31mWrong choise, start over!\033[1;00m\n");
                    exit(0);
                    break;
            }
            break;
        
        case 2:// 1st byte in CAN ID, contains Error code
            switch(selection){
                case 1: //Error code, normal
                    canid->cmdType = ((canid->cmdType)<<3)|0b000;
                    break;
                case 2: //Error code, okay
                    canid->cmdType = ((canid->cmdType)<<3)|0b001;
                    break;
                case 3: //Error code, busy
                    canid->cmdType = ((canid->cmdType)<<3)|0b010;
                    break;
                case 4: //Error code, invalid commad
                    canid->cmdType = ((canid->cmdType)<<3)|0b011;
                    break;
                case 5: //Error code, invalid data
                    canid->cmdType = ((canid->cmdType)<<3)|0b100;
                    break;
                default:
                    printf("\033[1;31mWrong choise, start over!\033[1;00m\n");
                    exit(0);
                    break;
            }
            break;

        case 3:// 2n byte cmd
            switch(selection){
                case 0: //set config 
                    canid->cmd = 0x00;
                    break;
                case 1: //ser req voltage
                    canid->cmd = 0x01;
                    break;
                case 2: //get max volt
                    canid->cmd = 0x02;
                    break;
                case 3: //set port auth
                    canid->cmd = 0x03;
                    break;
                case 4: //get port mesurement
                    canid->cmd = 0x04;
                    break;
                case 5: //set TMC temp
                    canid->cmd = 0x05;
                    break;
                case 6: //set ESC state
                    canid->cmd = 0x06;
                    break;
                case 7: //set max power
                    canid->cmd = 0x07;
                    break;
                case 8: //set log data
                    canid->cmd = 0x08;
                    break;
                default:
                    printf("\033[1;31mWrong choise, start over!\033[1;00m\n");
                    exit(0);
                    break;
            }
            break;
        case 41:// 3rd byte source address, 1st part controller board type
            switch(selection){
                case 1://port controller
                    canid->sourceAddr = 0b000;
                    break;
                case 2://cabinet controller
                    canid->sourceAddr = 0b001;
                    break;
                case 3://network controller
                    canid->sourceAddr = 0b010;
                    break;
                case 4://thermal managment controller
                    canid->sourceAddr = 0b011;
                    break;
                case 5://environmental sensor controller
                    canid->sourceAddr = 0b100;
                    break;
                case 6://boadcast
                    canid->sourceAddr = 0b111;
                    break;
                default:
                    printf("\033[1;31mWrong choise, start over!\033[1;00m\n");
                    exit(0);
                    break;
            }
            break;
        case 42:// 3rd byte source address, 2nd part post numebr
            canid->sourceAddr = (canid->sourceAddr)<<2 | selection;     
            break;
        
        case 43:// 3rd byte source address, 3rd part boar number
            canid->sourceAddr = (canid->sourceAddr)<<3 | selection;     
            break;
        
        case 51:// 4th byte des address, 1st part controller board type
            switch(selection){
                case 1://port controller
                    canid->destAddr = 0b000;
                    break;
                case 2://cabinet controller
                    canid->destAddr = 0b001;
                    break;
                case 3://network controller
                    canid->destAddr = 0b010;
                    break;
                case 4://thermal managment controller
                    canid->destAddr = 0b011;
                    break;
                case 5://environmental sensor controller
                    canid->destAddr = 0b100;
                    break;
                case 6://boadcast
                    canid->destAddr = 0b111;
                    break;
                default:
                    printf("\033[1;31mWrong choise, start over!\033[1;00m\n");
                    exit(0);
                    break;
            }
            break;
        case 52:// 4th byte des address, 2nd part post numebr
            canid->destAddr = (canid->destAddr)<<2 | selection;     
            break;
        
        case 53:// 4th byte des address, 3rd part boar number
            canid->destAddr = (canid->destAddr)<<3 | selection;     
            break;
        
        default:
            printf("\033[1;31mWrong choise, start over!\033[1;00m\n");
            exit(0);
            break;
    }

    if (title == 53){
        printf("id:\033[1;33m %02X %02X %02X %02X\033[1;00m data: 00 11 22 33 44 55 66 77\n",canid->cmdType,canid->cmd,canid->sourceAddr,canid->destAddr);
    }
    else{
        printf("id:\033[1;32m %02X %02X %02X %02X\033[1;00m data: 00 11 22 33 44 55 66 77\n",canid->cmdType,canid->cmd,canid->sourceAddr,canid->destAddr);
    }
    

}

int main(){

    int selection;
    struct CanId canid; 


    printf("[1;31mCharger data transfer protocol - Msg generator\n");
    printf("* CAN ID ---------------\n");
    printf("\n1. Command Type\n   1: Request\n   2: Responce\n> ");
    scanf("%d",&selection);
    add(&canid,selection,1);
    
    printf("\n2. Error Code\n   1: Normal\n   2: Okay\n   3: Busy\n   4: Invalid Command\n   5: Invalid Data\n> ");
    scanf("%d",&selection);
    add(&canid,selection,2);
    
    printf("\n3. Command\n   0: Set Config\n   1: Set request voltage\n   2: Get maximum voltage\n   3: Set port authentication\n   4: Get port mesurement\n   5: Set TMC temp\n   6: Set ESC state\n   7: Set TMC temp\n   8: Set log data\n> ");
    scanf("%d",&selection);
    add(&canid,selection,3);
    
    printf("\n4. Source Address\n");
    printf("4.1. Device\n   1: PC\n   2: CC\n   3: NC\n   4: TMC\n   5: ESC \n> ");
    scanf("%d",&selection);
    add(&canid,selection,41);
    printf("4.2. Enter post number(0-5)\n> ");
    scanf("%d",&selection);
    add(&canid,selection,42);
    printf("4.3. Enter board number(0-7)\n> ");
    scanf("%d",&selection);
    add(&canid,selection,43);
    
    printf("\n5. Destination Address\n");
    printf("5.1. Device\n   1: PC\n   2: CC\n   3: NC\n   4: TMC\n   5: ESC \n> ");
    scanf("%d",&selection);
    add(&canid,selection,51);
    printf("5.2. Enter post number(0-5)\n> ");
    scanf("%d",&selection);
    add(&canid,selection,52);
    printf("5.3. Enter board number(0-7)\n> ");
    scanf("%d",&selection);
    add(&canid,selection,53);

    printf("\n* CAN DATA ---------------\n> ");
    printf("1. Enter data(8 bytes long)\n> ");

    return 0;
}