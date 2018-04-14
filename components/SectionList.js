'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  StyleSheet,
  View,
  Text,
  NativeModules,
} from 'react-native';

const { UIManager } = NativeModules;

const noop = () => {};
const returnTrue = () => true;

export default class SectionList extends Component {

  constructor(props, context) {
    super(props, context);

    this.onSectionSelect = this.onSectionSelect.bind(this);
    this.resetSection = this.resetSection.bind(this);
    this.detectAndScrollToSection = this.detectAndScrollToSection.bind(this);
    this.lastSelectedIndex = null;
  }

  onSectionSelect(sectionId, fromTouch) {
    this.props.onSectionSelect && this.props.onSectionSelect(sectionId);

    if (!fromTouch) {
      this.lastSelectedIndex = null;
    }
  }

  resetSection() {
    this.lastSelectedIndex = null;
  }

  detectAndScrollToSection(e) {
    const ev = e.nativeEvent.touches[0];
    //var rect = {width:1, height:1, x: ev.locationX, y: ev.locationY};
    //var rect = [ev.locationX, ev.locationY];

    //UIManager.measureViewsInRect(rect, e.target, noop, (frames) => {
    //  if (frames.length) {
    //    var index = frames[0].index;
    //    if (this.lastSelectedIndex !== index) {
    //      this.lastSelectedIndex = index;
    //      this.onSectionSelect(this.props.sections[index], true);
    //    }
    //  }
    //});
    //UIManager.findSubviewIn(e.target, rect, viewTag => {
      //this.onSectionSelect(view, true);
    //})
    
    let targetY = ev.pageY;
    const { y, height } = this.measure;
    if(!y || targetY < y){
      return;
    }
    let index = Math.floor((targetY - y) / height);
    index = Math.min(index, this.props.sections.length - 1);
    if (this.lastSelectedIndex !== index && this.props.data[this.props.sections[index]].length) {
      this.lastSelectedIndex = index;
      this.onSectionSelect(this.props.sections[index], true);
    }
    
    
  }

  fixSectionItemMeasure() {
    const sectionItem = this.refs.sectionItem0;
    if (!sectionItem) {
      return;
    }
    this.measureTimer = setTimeout(() => {
      sectionItem.measure((x, y, width, height, pageX, pageY) => {
        //console.log([x, y, width, height, pageX, pageY]);
        this.measure = {
          y: pageY,
          width,
          height
        };
      })
    }, 0);
  }

  componentDidMount() {
    this.fixSectionItemMeasure();
  }

  // fix bug when change data 
  componentDidUpdate() {
    this.fixSectionItemMeasure();
  }

  componentWillUnmount() {
    this.measureTimer && clearTimeout(this.measureTimer);
  }

  render() {
    const SectionComponent = this.props.component;
    const sections = this.props.sections.map((section, index) => {
      const title = this.props.getSectionListTitle ?
        this.props.getSectionListTitle(section) :
        section;

      const textStyle = this.props.data[section].length ?
        styles.text :
        styles.inactivetext;

      const child = SectionComponent ?
        <SectionComponent
          sectionId={section}
          title={title}
        /> :
        <View
          style={styles.item}>
          <Text style={[textStyle, this.props.fontStyle]}>{title}</Text>
        </View>;

      //if(index){
        return (
          <View key={index} ref={'sectionItem' + index} pointerEvents="none">
            {child}
          </View>
        );
      //}
      //else{
      //  return (
      //    <View key={index} ref={'sectionItem' + index} pointerEvents="none"
      //          onLayout={e => {console.log(e.nativeEvent.layout)}}>
      //      {child}
      //    </View>
      //  );
      //
      //}
    });

    return (
      <View ref="view" style={[styles.container, this.props.style]}
        onStartShouldSetResponder={returnTrue}
        onMoveShouldSetResponder={returnTrue}
        onResponderGrant={this.detectAndScrollToSection}
        onResponderMove={this.detectAndScrollToSection}
        onResponderRelease={this.resetSection}
      >
        {sections}
      </View>
    );
  }
}

SectionList.propTypes = {

  /**
   * A component to render for each section item
   */
  component: PropTypes.func,

  /**
   * Function to provide a title the section list items.
   */
  getSectionListTitle: PropTypes.func,

  /**
   * Function to be called upon selecting a section list item
   */
  onSectionSelect: PropTypes.func,

  /**
   * The sections to render
   */
  sections: PropTypes.array.isRequired,

  /**
   * A style to apply to the section list container
   */
  style: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
  ]),

  /**
   * Text font size
   */
  fontStyle: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object,
  ]),
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'transparent',
    alignItems:'flex-end',
    justifyContent:'flex-start',
    right: 5,
    top: 0,
    bottom: 0
  },

  item: {
    padding: 0
  },

  text: {
    fontWeight: '700',
    color: '#008fff'
  },

  inactivetext: {
    fontWeight: '700',
    color: '#CCCCCC'
  }
});
