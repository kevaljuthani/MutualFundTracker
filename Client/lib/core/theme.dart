import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: Color(0xFF007AFF), // iOS Blue
        secondary: Color(0xFF34C759), // iOS Green
        surface: Color(0xFFF2F2F7), // iOS System Background

        error: Color(0xFFFF3B30), // iOS Red
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Color(0xFF000000),

        onError: Colors.white,
      ),
      scaffoldBackgroundColor: const Color(0xFFF2F2F7),
      fontFamily: GoogleFonts.inter().fontFamily,
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: const TextStyle(
            color: Color(0xFF000000),
            fontWeight: FontWeight.bold,
            letterSpacing: -1.0),
        displayMedium: const TextStyle(
            color: Color(0xFF000000),
            fontWeight: FontWeight.bold,
            letterSpacing: -0.5),
        bodyLarge: const TextStyle(color: Color(0xFF000000)),
        bodyMedium:
            const TextStyle(color: Color(0xFF3C3C43)), // Secondary label color
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
            color: Color(0xFF000000),
            fontSize: 17,
            fontWeight: FontWeight.w600),
        iconTheme: IconThemeData(color: Color(0xFF007AFF)),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white.withValues(alpha: 0.7), // Glass effect base
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side:
              BorderSide(color: Colors.white.withValues(alpha: 0.5), width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.6),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.black.withValues(alpha: 0.05)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF007AFF), width: 2),
        ),
      ),
      extensions: <ThemeExtension<dynamic>>[
        GlassTheme(
          glassColor: Colors.white.withValues(alpha: 0.65),
          borderColor: Colors.white.withValues(alpha: 0.3),
          blurAmount: 20.0,
        ),
      ],
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFF0A84FF), // iOS Dark Mode Blue
        secondary: Color(0xFF30D158), // iOS Dark Mode Green
        surface: Color(0xFF1C1C1E), // iOS System Gray 6 Dark

        error: Color(0xFFFF453A), // iOS Dark Mode Red
        onPrimary: Colors.white,
        onSecondary: Colors.black,
        onSurface: Colors.white,

        onError: Colors.black,
      ),
      scaffoldBackgroundColor: const Color(0xFF000000),
      fontFamily: GoogleFonts.inter().fontFamily,
      textTheme:
          GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: -1.0),
        displayMedium: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.5),
        bodyLarge: const TextStyle(color: Colors.white),
        bodyMedium: const TextStyle(
            color: Color(0xFFEBEBF5)), // Secondary label color dark
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
            color: Colors.white, fontSize: 17, fontWeight: FontWeight.w600),
        iconTheme: IconThemeData(color: Color(0xFF0A84FF)),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: const Color(0xFF1C1C1E).withValues(alpha: 0.6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side:
              BorderSide(color: Colors.white.withValues(alpha: 0.1), width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1C1C1E).withValues(alpha: 0.6),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: Color(0xFF0A84FF), width: 2),
        ),
      ),
      extensions: <ThemeExtension<dynamic>>[
        GlassTheme(
          glassColor: const Color(0xFF1C1C1E).withValues(alpha: 0.65),
          borderColor: Colors.white.withValues(alpha: 0.1),
          blurAmount: 20.0,
        ),
      ],
    );
  }
}

@immutable
class GlassTheme extends ThemeExtension<GlassTheme> {
  final Color? glassColor;
  final Color? borderColor;
  final double? blurAmount;

  const GlassTheme({
    this.glassColor,
    this.borderColor,
    this.blurAmount,
  });

  @override
  GlassTheme copyWith({
    Color? glassColor,
    Color? borderColor,
    double? blurAmount,
  }) {
    return GlassTheme(
      glassColor: glassColor ?? this.glassColor,
      borderColor: borderColor ?? this.borderColor,
      blurAmount: blurAmount ?? this.blurAmount,
    );
  }

  @override
  GlassTheme lerp(ThemeExtension<GlassTheme>? other, double t) {
    if (other is! GlassTheme) {
      return this;
    }
    return GlassTheme(
      glassColor: Color.lerp(glassColor, other.glassColor, t),
      borderColor: Color.lerp(borderColor, other.borderColor, t),
      blurAmount: orgLerpDouble(blurAmount, other.blurAmount, t),
    );
  }

  // Helper to interp doubles
  double? orgLerpDouble(double? a, double? b, double t) {
    if (a == null && b == null) return null;
    a ??= 0.0;
    b ??= 0.0;
    return a + (b - a) * t;
  }
}
