import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { Controller, FieldValues, Path, Control } from "react-hook-form";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type Props<T extends FieldValues> = TextInputProps & {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  secureText?: boolean;
  rightIcon?: ReactNode;
  onChangeTransform?: (value: string) => string;
};

export default function MyInput<T extends FieldValues>({
  name,
  control,
  label,
  secureText = false,
  rightIcon,
  onChangeTransform,
  ...rest
}: Props<T>) {
  const [hidden, setHidden] = useState(secureText);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="gap-1">
          {label && (
            <Text className="text-sm text-gray-700 font-medium">{label}</Text>
          )}

          <View
            className={`flex-row items-center border rounded-xl px-4 bg-white ${
              error ? "border-red-400" : "border-border"
            }`}
          >
            <TextInput
              className="flex-1 py-4 text-base text-gray-900"
              onBlur={onBlur}
              onChangeText={(text) =>
                onChange(onChangeTransform ? onChangeTransform(text) : text)
              }
              value={value}
              secureTextEntry={hidden}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9E9589"
              underlineColorAndroid="transparent"
              {...rest}
            />

            {secureText && (
              <TouchableOpacity
                onPress={() => setHidden((prev) => !prev)}
                hitSlop={8}
              >
                <Ionicons
                  name={hidden ? "chevron-down" : "chevron-up"}
                  size={18}
                  color="#9E9589"
                />
              </TouchableOpacity>
            )}

            {!secureText && rightIcon && rightIcon}
          </View>

          {error && (
            <Text className="text-red-500 text-xs">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
}
