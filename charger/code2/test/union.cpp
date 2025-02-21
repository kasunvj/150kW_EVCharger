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
}id;

struct CommandType{
    unsigned int reqest =   0;
    unsigned int responce = 1;
    unsigned int getNumb(string type){
        if(type.compare("request") == 0)
            return reqest;
        else if(type.compare("responce") == 0) 
            return responce;
        else
            return 0;
    }
    string getName(int type){
        switch(type){
            case 0:
                return "request";break;
            case 1:
                return "responce";break;
            default:
                return "Not defined"; break;
        }  
    }
}commandType;

struct ErrorType{ 
    unsigned int normal =    0;
    unsigned int fault =     1;
    unsigned int busy =      2;
    unsigned int invalcmd =  3;
    unsigned int invaldata = 4;
    unsigned int getNumb(string type){
        if(type.compare("normal") == 0)
            return normal;
        else if(type.compare("fault") == 0) 
            return fault;
        else if(type.compare("busy") == 0) 
            return busy;
        else if(type.compare("invalcmd") == 0) 
            return invalcmd;
        else if(type.compare("invaldata") == 0) 
            return invaldata;
        else
            return 0;
    }
    string getName(int type){
        switch(type){
            case 0:
                return "normal";break;
            case 1:
                return "fault";break;
            case 2:
                return "busy";break;
            case 3:
                return "responce";break;
            case 4:
                return "invaldata";break;
            default:
                return "Not defined"; break;
        }  
    }

    
}errorType;

struct NodeType{
    unsigned int pc =  0;
    unsigned int cc =  1;
    unsigned int nc =  2;
    unsigned int tmc = 3;
    unsigned int esc = 4;
    unsigned int brd = 5;
    unsigned int getNumb(string type){
        if(type.compare("pc") == 0)
            return pc;
        else if(type.compare("cc") == 0) 
            return cc;
        else if(type.compare("nc") == 0) 
            return nc;
        else if(type.compare("tmc") == 0) 
            return tmc;
        else if(type.compare("esc") == 0) 
            return esc;
        else if(type.compare("brd") == 0) 
            return brd;
        else
            return 0;
    }
    string getName(int type){
        switch(type){
            case 0:
                return "pc";break;
            case 1:
                return "cc";break;
            case 2:
                return "nc";break;
            case 3:
                return "tmc";break;
            case 4:
                return "esc";break;
            case 5:
                return "brd";break;
            default:
                return "Not defined"; break;
        }  
    }
}nodeType;

struct Command{
    unsigned int set_ota =            0;
    unsigned int set_config =         1;
    unsigned int set_voltagecurent =  2;
    unsigned int get_maxvoltage =     3;
    unsigned int set_portauth =       4;
    unsigned int get_portmesurement = 5;
    unsigned int set_tmctemp =        6;
    unsigned int set_escstate =       7;
    unsigned int set_maxpower =       8;
    unsigned int set_logdata =        9;
    unsigned int net_sync =          10;

    unsigned int getNumb(string type){
        if(type.compare("set_ota") == 0)
            return set_ota;
        else if(type.compare("set_config") == 0) 
            return set_config;
        else if(type.compare("set_voltagecurent") == 0) 
            return set_voltagecurent;
        else if(type.compare("get_maxvoltage") == 0) 
            return get_maxvoltage;
        else if(type.compare("set_portauth") == 0) 
            return set_portauth;
        else if(type.compare("get_portmesurement") == 0) 
            return get_portmesurement;
        else if(type.compare("set_tmctemp") == 0) 
            return set_tmctemp;
        else if(type.compare("set_escstate") == 0) 
            return set_escstate ;
        else if(type.compare("set_maxpower") == 0) 
            return set_maxpower;
        else if(type.compare("set_logdata") == 0) 
            return set_logdata;
        else if(type.compare("net_sync") == 0) 
            return net_sync;
        else
            return 9;
    }
    string getName(int type){
        switch(type){
            case 0:
                return "set_ota";break;
            case 1:
                return "set_config";break;
            case 2:
                return "set_voltagecurent";break;
            case 3:
                return "get_maxvoltage";break;
            case 4:
                return "set_portauth";break;
            case 5:
                return "get_portmesurement";break;
            case 6:
                return "set_tmctemp";break;
            case 7:
                return "set_escstate";break;
            case 8:
                return "set_maxpower";break;
            case 9:
                return "set_logdata";break;
            case 10:
                return "net_sync";break;
            default:
                return "Not defined"; break;
        }  
    }
}command;

void dummyEncode(string source,
                     int postid_s, 
                     int boardid_s, 
                     string dest,
                     int post_d,
                     int boardid_d,
                     string type,
                     string error,
                     string cmmd,
                     string data){
    
    union ID id;

    cout << nodeType.getName(nodeType.getNumb(dest)) <<endl;
    cout << nodeType.getName(nodeType.getNumb(source)) <<endl;
    cout << command.getName(command.getNumb(cmmd)) <<endl;
    cout << errorType.getName(errorType.getNumb(error)) <<endl;
    cout << commandType.getName(commandType.getNumb(type)) <<endl;

    id.bits.desBoard = boardid_d;
    id.bits.desPost = post_d;
    id.bits.desType = nodeType.getNumb(dest);
    id.bits.srcBoard = boardid_s;
    id.bits.srcPost = postid_s;
    id.bits.srcType = nodeType.getNumb(source);
    id.bits.cmd = command.getNumb(cmmd);
    id.bits.err = errorType.getNumb(error);
    id.bits.cmdType = commandType.getNumb(type);
    id.bits.unalloc = 0;

    cout << "---------------" <<endl;

    printf("%d %x\n",id.canId,id.canId);

}

int main(){

    dummyEncode("pc",0,0,"nc",0,0,"responce","error","net_sync","");

    return 0;
}