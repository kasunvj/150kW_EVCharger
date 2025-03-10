#include <napi.h>

// Example: Function to add two numbers
Napi::Number Add(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 2 || !info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Expected two numbers").ThrowAsJavaScriptException();
        return Napi::Number::New(env, 0);
    }
    
    double sum = info[0].As<Napi::Number>().DoubleValue() + info[1].As<Napi::Number>().DoubleValue();
    return Napi::Number::New(env, sum);
}

// Initialize the module
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "add"), Napi::Function::New(env, Add));
    return exports;
}

NODE_API_MODULE(addon, Init)
