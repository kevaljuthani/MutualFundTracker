import 'package:flutter/material.dart';

class ThemeProvider with ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;

  ThemeMode get themeMode => _themeMode;

  bool get isDarkMode {
    if (_themeMode == ThemeMode.system) {
      return WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark;
    }
    return _themeMode == ThemeMode.dark;
  }

  void toggleTheme([bool? isOn]) {
    if (isOn != null) {
      _themeMode = isOn ? ThemeMode.dark : ThemeMode.light;
    } else {
      _themeMode = isDarkMode ? ThemeMode.light : ThemeMode.dark;
    }
    notifyListeners();
  }
}
