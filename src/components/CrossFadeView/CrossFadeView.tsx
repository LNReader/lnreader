import React, {PureComponent, Children, ReactNode} from 'react';
import {View, Animated, StyleSheet, ViewStyle} from 'react-native';

type PointerEvents = 'none' | 'box-none' | undefined;

interface FadeViewProps {
  animationDuration: number;
  active: boolean;
  removeHiddenSubviews: boolean;
  children: ReactNode;
  style: ViewStyle;
}

interface FadeViewState {
  progress: Animated.Value;
  animating: boolean;
}

export default class CrossFadeView extends PureComponent<
  FadeViewProps,
  FadeViewState
> {
  static defaultProps = {
    animationDuration: 225,
    active: false,
    removeHiddenSubviews: true,
  };

  mounted = false;

  constructor(props: FadeViewProps) {
    super(props);

    this.renderChild = this.renderChild.bind(this);
    this.mounted = false;

    let {active} = this.props;

    this.state = {
      progress: new Animated.Value(Number(active)),
      animating: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  UNSAFE_componentWillReceiveProps({
    active,
    animationDuration,
  }: {
    active: boolean;
    animationDuration: number;
  }) {
    let {progress} = this.state;

    if (active !== this.props.active) {
      this.setState({animating: true});

      Animated.timing(progress, {
        toValue: Number(active),
        duration: animationDuration,
        useNativeDriver: true,
      }).start(() => {
        if (this.mounted) {
          this.setState({animating: false});
        }
      });
    }
  }

  renderChild(child: ReactNode, index: number) {
    let {active, removeHiddenSubviews} = this.props;
    let {animating, progress} = this.state;

    let opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: index ? [0, 1] : [1, 0],
    });

    let hidden = active !== Boolean(index);

    if (removeHiddenSubviews) {
      if (!animating && hidden) {
        return null;
      }
    }

    let pointerEvents: PointerEvents = hidden ? 'none' : 'box-none';

    return (
      <Animated.View
        style={[styles.container, {opacity}]}
        pointerEvents={pointerEvents}
      >
        {child}
      </Animated.View>
    );
  }

  render() {
    let {children, style, ...props} = this.props;

    return (
      <View style={style} {...props}>
        {Children.map(children, this.renderChild)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
