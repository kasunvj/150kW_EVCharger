{
  "targets": [
    {
      "target_name": "addon",
      "sources": ["addonx.cpp"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "cflags": ["-std=c++17"],
      "cflags_cc": ["-std=c++17"]
    }
  ]
}
