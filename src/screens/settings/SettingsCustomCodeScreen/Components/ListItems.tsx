import { useTheme } from '@hooks/persisted';
import { useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import { Text } from 'react-native-paper';

const windowDimensions = Dimensions.get('window');
const fontSize = 14 * windowDimensions.fontScale;
export const LIST_ITEM_LINE_HEIGHT = fontSize * 1.2;

export const ReplaceItem = ({
  item,
  removeItem,
  editItem,
}: {
  item: [string, string];
  removeItem: (identifier: string | number) => void;
  editItem: (item: string[]) => void;
}) => {
  const theme = useTheme();
  const colorTheme = useMemo(() => {
    return { colors: theme };
  }, [theme]);
  return (
    <Pressable
      style={[styles.row, styles.itemRow]}
      onPress={() => editItem(item)}
    >
      <Text numberOfLines={1} style={styles.textItem} theme={colorTheme}>
        {item[0]}
      </Text>
      <Icon
        name="arrow-right-bold"
        size={LIST_ITEM_LINE_HEIGHT}
        color={theme.onBackground}
      />
      <View style={[styles.textItem, styles.row]}>
        <Text
          numberOfLines={1}
          style={[styles.textItem, styles.textItemRight]}
          theme={colorTheme}
        >
          {item[1]}
        </Text>
        <Icon
          name="trash-can-outline"
          size={LIST_ITEM_LINE_HEIGHT}
          color={theme.onBackground}
          onPress={e => {
            e.stopPropagation();
            removeItem(item[0]);
          }}
        />
      </View>
    </Pressable>
  );
};

export const RemoveItem = ({
  item,
  index,
  removeItem,
  editItem,
}: {
  item: string;
  index: number;
  removeItem: (identifier: string | number) => void;
  editItem: (item: string[]) => void;
}) => {
  const theme = useTheme();
  const colorTheme = useMemo(() => {
    return { colors: theme };
  }, [theme]);
  return (
    <Pressable
      style={[styles.row, styles.itemRow]}
      onPress={() => editItem([item])}
    >
      <Text numberOfLines={1} style={styles.textItem} theme={colorTheme}>
        {item}
      </Text>
      <Icon
        name="trash-can-outline"
        size={LIST_ITEM_LINE_HEIGHT}
        color={theme.onBackground}
        onPress={() => removeItem(index)}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  textfield: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    verticalAlign: 'middle',
  },
  itemRow: {
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginVertical: 8,
    height: LIST_ITEM_LINE_HEIGHT,
  },
  textItem: {
    flexGrow: 1,
    flexBasis: '40%',
    overflow: 'hidden',
    fontSize,
    lineHeight: LIST_ITEM_LINE_HEIGHT,
  },
  textItemRight: {
    textAlign: 'right',
  },
  spaceItem: {
    flexShrink: 1,
    textAlign: 'center',
    flexBasis: '10%',
  },
});
