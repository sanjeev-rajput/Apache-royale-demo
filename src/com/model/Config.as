package com.model {

  public class Config {

    // ✅ Internal Constants
    private static const LIVE_SERVER:String = "apache-roayle-demo-app.onrender.com";
    private static const LOCAL_SERVER:String = "localhost:3000";

    // ✅ Internal State
    private static var _serverUrl:String = LOCAL_SERVER; // Default to local
    private static var _isLocal:Boolean = true;

    private static var _productJson:Object;

    // 🚫 Prevent instantiation
    public function Config() {
      throw new Error("Config is a static class and cannot be instantiated.");
    }

    // ✅ Called during app startup to set environment (LIVE or LOCAL)
    // Set from product.json value: "LIVE" or "LOCAL"
    public static function set serverEnvironment(value:String):void {
      var env:String = value.toUpperCase();
      if (env === "LIVE") {
        _isLocal = false;
        _serverUrl = LIVE_SERVER;
      } else if (env === "LOCAL") {
        _isLocal = true;
        _serverUrl = LOCAL_SERVER;
      } else {
        throw new Error("Invalid environment. Use 'LIVE' or 'LOCAL'.");
      }
    }

    // ✅ Returns base server (e.g., localhost:3000 or live URL)
    public static function get serverHost():String {
      return _serverUrl;
    }

    // ✅ Returns full API URL
    // Automatically picks protocol based on environment
    public static function get apiBaseUrl():String {
      var protocol:String = _isLocal ? "http://" : "https://";
      return protocol + _serverUrl + "/api/";
    }

    // ✅ Returns WebSocket URL (ws:// or wss:// based on environment)
    public static function get wsUrl():String {
      var protocol:String = _isLocal ? "ws://" : "wss://";
      return protocol + _serverUrl;
    }


    // ✅ Flag for checking local development
    public static function get isLocal():Boolean {
      return _isLocal;
    }

    // ✅ Example additional config
    public static function get version():String {
      return "1.0.0";
    }

    public static function get productJson():Object {
      return _productJson;
    }
    public static function set productJson(value:Object):void {
      _productJson = value;
    }
  }
}
