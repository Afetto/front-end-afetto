import { Text, TouchableOpacity } from "react-native";
import { View } from "react-native-reanimated/lib/typescript/Animated";

type SelectOption = { label: string; value: string };

type SelectFieldProps = {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};


export function SelectField({ label, options, value, onChange, error }: SelectFieldProps) {
  return (
    <View className="gap-1">
      <Text className="text-sm text-gray-700 font-medium">{label}</Text>
      <View className="flex-row gap-2 flex-wrap">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
              className={`flex-1 items-center justify-center py-3 rounded-2xl border ${selected
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-200"
                }`}
            >
              <Text
                className={`text-sm font-medium ${selected ? "text-white" : "text-gray-600"
                  }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-0.5">{error}</Text>
      )}
    </View>
  );
}