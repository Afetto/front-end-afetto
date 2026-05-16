import { View } from "react-native";

export default function ConcentricCircles() {
  return (
    <View className="h-[200px] items-center overflow-hidden">
      <View className="absolute -bottom-[300px] w-[500px] h-[500px] rounded-full bg-[rgba(210,200,140,0.25)]" />
      <View className="absolute -bottom-[240px] w-[400px] h-[400px] rounded-full bg-[rgba(220,195,100,0.35)]" />
      <View className="absolute -bottom-[185px] w-[300px] h-[300px] rounded-full bg-[rgba(225,180,70,0.55)]" />
      <View className="absolute -bottom-[135px] w-[210px] h-[210px] rounded-full bg-golden" />
    </View>
  );
}
