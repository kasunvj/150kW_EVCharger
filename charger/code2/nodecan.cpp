#include "nodecan.hpp"

using namespace std; 

scpp::SocketCan can;
Encoder encoder;
Decoder decoder;
mutex cout_mutex;
TxBuffer txbuf;
RxBuffer rxbuf;
ReceiveRawMsg rxmsg;
array<std::unique_ptr<Device>, MAX_DEVICES_PER_POST> devices;


void NetworkControllers :: init() const {
    cout << "Network Controller Checking.."<< endl;

};
    
void PortControllers :: init() const {
    cout << "Port Controller Speaking"<< endl;
};

void Decoder :: readProtocolData(ReceiveRawMsg& msg){
    //printf("Decoder> : id: %x \n",msg.getId());

    union ID readId;
    union Data readData;

    readId.canId = msg.getId() & 0x1FFFFFFF;

    printf("desBoard : %u\n", readId.bits.desBoard);
    printf("desPost  : %u\n", readId.bits.desPost);
    printf("desType  : %u\n", readId.bits.desType);
    printf("srcBoard : %u\n", readId.bits.srcBoard);
    printf("srcPost  : %u\n", readId.bits.srcPost);
    printf("srcType  : %u\n", readId.bits.srcType);
    printf("cmd      : %u\n", readId.bits.cmd);
    printf("err      : %u\n", readId.bits.err);
    printf("cmdType  : %u\n", readId.bits.cmdType);
    printf("unalloc  : %u\n", readId.bits.unalloc);

    readData.canData = msg.getData64();
    printf("data1 : %02x\n", readData.bytes[0]);
    printf("data2 : %02x\n", readData.bytes[1]);
    printf("data3 : %02x\n", readData.bytes[2]);
    printf("data4 : %02x\n", readData.bytes[3]);
    printf("data5 : %02x\n", readData.bytes[4]);
    printf("data6 : %02x\n", readData.bytes[5]);
    printf("data7 : %02x\n", readData.bytes[6]);
    printf("data8 : %02x\n", readData.bytes[7]);
    
    switch(readId.bits.cmd){
        case 11:
            pritnf( "Checking the device list\n");
            //check device type
            if(readId.bits.srcType == 0){
                if(checkingDevices(0,0,0)){
                    cout << "Device Existed"<< endl;
                }
                else{
                    cout << "Device Not avilable, create it"<< endl;
                }
            }
            //filter all devices which are in that type from device array
            //check postID & boardid 
            //is found pass
            //if not , create a object
            //assign portid
            //push to device array
            break;
        default:
            break;
    }




};

int Encoder :: writeProtocolData(Message& msg){

    ID id;
    Data data;
    NodeType nodeType;
    CommandType commandType;
    CommandName commandName;
    ErrorType errorType;
    TransmitRawMsg txmsg;
    
    cout << nodeType.getName(nodeType.getNumb(msg.dest)) <<endl;
    cout << nodeType.getName(nodeType.getNumb(msg.source)) <<endl;
    cout << commandName.getName(commandName.getNumb(msg.devcommand)) <<endl;
    cout << errorType.getName(errorType.getNumb(msg.error)) <<endl;
    cout << commandType.getName(commandType.getNumb(msg.type)) <<endl;

    //prepare CANID
    //TODO: need to set boundaries 
    id.bits.desBoard = msg.boardid_d;
    id.bits.desPost = msg.postid_d;
    id.bits.desType = nodeType.getNumb(msg.dest);
    id.bits.srcBoard = msg.boardid_s;
    id.bits.srcPost = msg.postid_s;
    id.bits.srcType = nodeType.getNumb(msg.source);
    id.bits.cmd = commandName.getNumb(msg.devcommand);
    id.bits.err = errorType.getNumb(msg.error);
    id.bits.cmdType = commandType.getNumb(msg.type);
    id.bits.unalloc = 0;

    //prepare CANData
    for(int i=0;i<8;i++){
        data.bytes[i] = i;
    }
    
    cout << "---------------" <<endl;
    printf("%d %x\n",id.canId,id.canId);
    cout << "---------------" <<endl;

    txmsg.set(id, data);
    txbuf.push(txmsg);
    
    return 0;
};



void initializeDevices(){
    
    int count = 0;

    devices[0] = make_unique<NetworkControllers>();
    
    devices[1] = make_unique<PortControllers>();
    
    for (int i=0; i< 2 ; i++ ) {
        devices[i]->init();
    }
    
};

int processCANMessages(){
    if(can.open("can0") == scpp::STATUS_OK)
        cout << "CAN - ok" << endl;
    else{
        cout << "CAN - fail" << endl;
        return -1;
    }
        
    
    
    scpp::CanFrame fr;
    
    while(1){
        
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        std::lock_guard<std::mutex> lock(cout_mutex);
        if(can.read(fr) == scpp::STATUS_OK){
            fr.id = fr.id & 0x1FFFFFFF; //In SocketCAN, the most significant bit (MSB) in fr.id is set when the CAN ID is an extended 29-bit identifier.
            printf("len %d byte, id: %x, data: %02x %02x %02x %02x %02x %02x %02x %02x  \n", fr.len, fr.id ,  
                    fr.data[0], fr.data[1], fr.data[2], fr.data[3],
                    fr.data[4], fr.data[5], fr.data[6], fr.data[7]);
            
            rxmsg.set(fr);
            rxbuf.push(rxmsg);
            printf("Reading id %x data from instance \n",rxmsg.getId());
            emit();
            
        }
        
        

    }
};

//void sendCANMessages(string source,int postid_s,int boardid_s, string dest,int post_d,int boardid_d,string type,string error,string command,string data){
void sendCANMessages(){
    while(1){
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        std::lock_guard<std::mutex> lock(cout_mutex);
        if(!txbuf.isEmpty()){
            cout << "sending buffer ++++++++++++++++++++++" << endl;
            SetColor(44); cout << "Transmit Buffer  H: "<< txbuf.getHead() << " T: "<<txbuf.getTail(); ResetColor(); cout<<endl;
            

            TransmitRawMsg txpop;
            txbuf.pop(txpop);

            //shoot to CAN bus
            scpp::CanFrame cf_to_write;   
            cf_to_write.id = txpop.getId() | CAN_EFF_FLAG;
            cf_to_write.len = 8;
            for (int i = 0; i < 8; ++i)
                cf_to_write.data[i] = txpop.getData()[i];
            auto write_sc_status = can.write(cf_to_write);
            printf("sent can ID %x\n", cf_to_write.id);
            if (write_sc_status != scpp::STATUS_OK){
                printf("something went wrong on socket write, error code : %d \n", int32_t(write_sc_status));
                txbuf.push(txpop);
            }
            else{
                printf("Message was written to the socket \n");
            }
            
            cout << "sending ++++++++++++++++++++++" << endl;
        }
        
    }
};



void ReceiveRawMsg :: set(scpp::CanFrame frame){
    id = frame.id;
    /*
    for(int i= 0; i< sizeof(data)/sizeof(data[0]); i++){
        data[i] = frame.data[i];
    }
    */
    for (int i = 0; i < 8; i++) {
        data.bytes[i] = frame.data[i];
    }
};

unsigned int ReceiveRawMsg :: getId(){
    return id;
};

uint8_t* ReceiveRawMsg :: getData(){
    return data.bytes;
};

uint64_t ReceiveRawMsg :: getData64(){
    return data.canData;
}

void Message :: setMessage(string source,
                            int postid_s, 
                            int boardid_s, 
                            string dest,
                            int postid_d,
                            int boardid_d,
                            string type,
                            string error,
                            string devcommand,
                            string data){
    source = source;
    postid_s = postid_s;
    boardid_s = boardid_s;
    dest = dest;
    postid_d = postid_d;
    boardid_d = boardid_d;
    type = type;
    error = error;
    devcommand = devcommand;
    data = data;
};

/*
Avtivity: send can packet object to the buffer 
@parm Messge object with defined ID written in human readble attribute values
*/
void send(Message& msg){
    encoder.writeProtocolData(msg);
};

void emit(){
    ReceiveRawMsg rxpop;
    rxbuf.pop(rxpop);
    
    SetColor(42); cout << "Receive Buffer H: " << rxbuf.getHead() << " T: " << rxbuf.getTail();ResetColor();cout << endl;
    
    decoder.readProtocolData(rxpop);

    
}

bool checkingDevices(int type, int postid, int boardid){

    printf("Numebr of devices %d\n",size );
    for (int i=0; i< sizeof(devices)/sizeof(devices[0]) ; i++){
        printf("%d\n",devices[i]);
    }
    return true;
}

void SetColor(int textColor)
{
    cout << "\033[" << textColor << "m";
}

void ResetColor() { cout << "\033[0m"; }



