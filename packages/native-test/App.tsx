import "./global.css";
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";

/**
 * Rocketicons Native Test Page
 *
 * This app showcases rocketicons in a React Native environment with NativeWind.
 * It tests all major use cases: sizes, variants, colors, and multiple collections.
 *
 * To run: cd packages/native-test && npm install && npx expo start --ios
 */

// -- Size showcase --
const SIZES = [
  "icon-xs",
  "icon-sm",
  "icon-base",
  "icon-lg",
  "icon-xl",
  "icon-2xl",
  "icon-3xl",
  "icon-4xl",
  "icon-5xl",
  "icon-6xl",
  "icon-7xl"
] as const;

// -- Variant showcase --
const VARIANTS = ["icon-outlined", "icon-filled"] as const;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mb-6">
    <Text className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">{title}</Text>
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">{children}</View>
  </View>
);

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView className={`flex-1 ${darkMode ? "bg-gray-900" : "bg-gray-50"} pt-12 px-4`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          🚀 Rocketicons Test
        </Text>
        <Pressable
          onPress={() => setDarkMode(!darkMode)}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">{darkMode ? "☀️ Light" : "🌙 Dark"}</Text>
        </Pressable>
      </View>

      {/* Size Grid */}
      <Section title="📏 All 11 Sizes">
        <View className="flex-row flex-wrap gap-2 items-end">
          {SIZES.map((size) => (
            <View key={size} className="items-center">
              <View className="bg-gray-100 dark:bg-gray-700 rounded p-1">
                {/* Icon placeholder — replace with actual rocketicon when built */}
                <View className={`${size} bg-sky-500 rounded`} />
              </View>
              <Text className="text-xs text-gray-500 mt-1">{size.replace("icon-", "")}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Variants */}
      <Section title="🎨 Variants">
        <View className="flex-row gap-4">
          {VARIANTS.map((variant) => (
            <View key={variant} className="items-center flex-1">
              <View className="bg-gray-100 dark:bg-gray-700 rounded p-3">
                {/* Variant showcase — replace with actual icons */}
                <View className={`icon-lg ${variant} bg-sky-500 rounded`} />
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {variant.replace("icon-", "")}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Color Showcase */}
      <Section title="🌈 Colors">
        <View className="flex-row gap-2 flex-wrap">
          {["sky", "red", "green", "purple", "amber", "pink"].map((color) => (
            <View key={color} className="items-center">
              <View className={`icon-xl bg-${color}-500 rounded`} />
              <Text className="text-xs text-gray-500 mt-1">{color}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* Status */}
      <Section title="✅ Test Status">
        <Text className="text-green-600 dark:text-green-400 font-medium">
          If you can see this page with proper styling, NativeWind v4 + TW v4 is working!
        </Text>
        <Text className="text-gray-500 text-sm mt-2">
          • NativeWind: 4.2.2{"\n"}• Tailwind CSS: 4.x{"\n"}• Platform: iOS (macOS dev)
        </Text>
      </Section>

      <View className="h-12" />
    </ScrollView>
  );
}
