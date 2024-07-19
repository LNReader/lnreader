import { FlashList, FlashListProps } from '@shopify/flash-list';
import { ReactElement, RefObject, useMemo } from 'react';

type FLashSectionListProps<T> = FlashListProps<T> & {
  sectionField: keyof T;
  /**
   * @param item The first item of section
   */
  renderSectionHeader: (item: T) => ReactElement;
  listRef?: RefObject<FlashList<T>>;
};

/**
 * @param data should be sorted array by `sectionField`
 * @param sectionField the field for grouping
 * @param renderSectionHeader render the header
 * You should use index in keyExtractor because the header item is a copy of section's first item
 */

const FLashSectionList = <T,>(props: FLashSectionListProps<T>) => {
  const {
    data,
    sectionField,
    renderItem,
    renderSectionHeader,
    listRef,
    ...otherProps
  } = props;
  const _data = useMemo(() => {
    return data?.reduce((prev, cur) => {
      if (
        prev.length === 0 ||
        cur[props.sectionField] != prev[prev.length - 1][sectionField]
      ) {
        prev.push({ ...cur, _type: 'header' });
      }
      prev.push(cur);
      return prev;
    }, [] as T[]);
  }, [data, props.extraData]);

  return (
    <FlashList
      {...otherProps}
      ref={listRef}
      data={_data}
      renderItem={renderProps => {
        // @ts-ignore
        switch (renderProps.item._type) {
          case 'header':
            return renderSectionHeader(renderProps.item);
          default:
            return renderItem?.(renderProps) || null;
        }
      }}
      // @ts-ignore
      getItemType={item => item._type}
    />
  );
};

export default FLashSectionList;
