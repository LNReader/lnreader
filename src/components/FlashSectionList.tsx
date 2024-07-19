import { FlashList, FlashListProps } from '@shopify/flash-list';
import { ReactElement, useMemo } from 'react';

type FLashSectionListProps<T> = FlashListProps<T> & {
  sectionField: keyof T;
  /**
   * @param item The first item of section
   */
  renderSectionHeader: (item: T) => ReactElement;
};

/**
 * @param data should be sorted array by `sectionField`
 * @param sectionField the field for grouping
 * @param renderSectionHeader render the header
 * You should use index in keyExtractor because the header item is a copy of section's first item
 */

function FLashSectionList<T>(props: FLashSectionListProps<T>) {
  type _T = T & { _type?: string };
  const data = useMemo(() => {
    return (props.data as _T[])?.reduce((prev, cur) => {
      if (
        prev.length === 0 ||
        cur[props.sectionField] != prev[prev.length - 1][props.sectionField]
      ) {
        prev.push({ ...cur, _type: 'header' });
      }
      prev.push(cur);
      return prev;
    }, [] as _T[]);
  }, [props.data, props.extraData]);

  return (
    <FlashList
      {...props}
      data={data}
      renderItem={renderProps => {
        switch (renderProps.item._type) {
          case 'header':
            return props.renderSectionHeader(renderProps.item);
          default:
            return props.renderItem?.(renderProps) || null;
        }
      }}
      getItemType={item => item._type}
    />
  );
}

export default FLashSectionList;
