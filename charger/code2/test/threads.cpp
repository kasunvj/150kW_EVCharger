#include <iostream>
#include <thread>
#include <chrono>
#include <mutex>

std::mutex cout_mutex;  // Mutex to prevent output overlap

void sendData() {
    int count = 0;
    while (true) {
        std::this_thread::sleep_for(std::chrono::seconds(1));  // Simulating delay
        std::lock_guard<std::mutex> lock(cout_mutex);
        std::cout << "Sending data: " << count++ << std::endl;
    }
}

void receiveData() {
    while (true) {
        std::this_thread::sleep_for(std::chrono::milliseconds(500));  // Simulating receiving delay
        std::lock_guard<std::mutex> lock(cout_mutex);
        std::cout << "Receiving data..." << std::endl;
    }
}

int main() {
    std::thread sender(sendData);
    std::thread receiver(receiveData);

    // Let both threads run indefinitely
    sender.join();
    receiver.join();

    return 0;
}
