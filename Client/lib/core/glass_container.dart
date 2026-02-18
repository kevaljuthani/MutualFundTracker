import 'dart:ui';
import 'package:flutter/material.dart';
import 'theme.dart';

class GlassContainer extends StatelessWidget {
  final Widget? child;
  final double? width;
  final double? height;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final BoxBorder? border; // Allow custom border override
  final Color? color; // Allow custom color override
  final double? blur; // Allow custom blur override

  const GlassContainer({
    super.key,
    this.child,
    this.width,
    this.height,
    this.padding,
    this.margin,
    this.borderRadius,
    this.border,
    this.color,
    this.blur,
  });

  @override
  Widget build(BuildContext context) {
    final glassTheme = Theme.of(context).extension<GlassTheme>();

    return Container(
      width: width,
      height: height,
      margin: margin,
      child: ClipRRect(
        borderRadius: borderRadius ?? BorderRadius.circular(20),
        child: BackdropFilter(
          filter: ImageFilter.blur(
            sigmaX: blur ?? glassTheme?.blurAmount ?? 20.0,
            sigmaY: blur ?? glassTheme?.blurAmount ?? 20.0,
          ),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: color ??
                  glassTheme?.glassColor ??
                  Colors.white.withValues(alpha: 0.65),
              borderRadius: borderRadius ?? BorderRadius.circular(20),
              border: border ??
                  Border.all(
                    color: glassTheme?.borderColor ??
                        Colors.white.withValues(alpha: 0.3),
                    width: 1.0,
                  ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
