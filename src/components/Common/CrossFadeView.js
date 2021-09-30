import PropTypes from 'prop-types';
import React, {PureComponent, Children} from 'react';
import {View, Animated, StyleSheet} from 'react-native';

export default class FadeView extends PureComponent {
  static defaultProps = {
    animationDuration: 225,

    active: false,
    removeHiddenSubviews: true,
  };

  static propTypes = {
    animationDuration: PropTypes.number,

    active: PropTypes.bool,
    removeHiddenSubviews: PropTypes.bool,

    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  constructor(props) {
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

  UNSAFE_componentWillReceiveProps({active, animationDuration}) {
    let {progress} = this.state;

    if (active ^ this.props.active) {
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

  renderChild(child, index) {
    let {active, removeHiddenSubviews} = this.props;
    let {animating, progress} = this.state;

    let opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: index ? [0, 1] : [1, 0],
    });

    let hidden = active ^ !!index;

    if (removeHiddenSubviews) {
      if (!animating && hidden) {
        return null;
      }
    }

    let pointerEvents = hidden ? 'none' : 'box-none';

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
    let {children, ...props} = this.props;

    return <View {...props}>{Children.map(children, this.renderChild)}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    // ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
