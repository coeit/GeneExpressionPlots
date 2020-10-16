import {
  action,
  computed,
  observable,
} from 'mobx';

import {
  computeAverage,
  computeVariance,
  createBarPlot,
} from '../utils/plotsHelper';

import preload from '../../data/preload.json';


class DataStore {

  /** @type {Group[]} */
  @observable groups = []
  @observable plots = []
  @observable preloaded = false;

  constructor (data) {
    if (Array.isArray(data) && data.length !== 0) {
      this.preloaded = true;
      this.groups = data;
    }
  }

  @computed({ keepAlive: true })
  get accessionIds() {
    if (this.groups.length) {

      if (this.groups[0].samples.length) {

        if (this.groups[0].samples[0].replicates.length) {

          return Object.keys(this.groups[0].samples[0].replicates[0]);

        }
      }
    }
    return [];

  }

  /**
   * Add a new group to the store.
   * @param {Group} group
   */
  @action addGroup(group) {
    this.groups.push(group);
  }

  /**
   * Add a new sample to an existing group.
   * @param {string} groupName name of the group
   * @param {Sample} sample
   */
  @action addSample(groupName, sample) {
    let foundGroup = this.groups.find(group => group.name === groupName);
    foundGroup.samples.push(sample);
  }

  @action clearData() {
    this.groups = [];
  }

  /**
   * Delete a group from the store
   * @param {number} index group index in the store
   */
  @action deleteGroup(index){
    this.groups.splice(index,1);
  }

  /**
   * Add replicates to an existing sample within a group. Adds a new sample/group if it doesn't exist yet
   * @param {object} groupView
   * @param {array} replicates
   */
  @action checkAndAddReplicates(groupView, replicates){
    let groupIndex = this.groups.findIndex(group => group.name === groupView.groupName);

    if (groupIndex !== -1) {
      let sampleIndex = this.groups[groupIndex].samples.findIndex(sample => sample.name === groupView.sampleName);
      if (sampleIndex !== -1) {
        this.groups[groupIndex].samples[sampleIndex].replicates.push(...replicates);
      } else {
        let newSample = {
          name: groupView.sampleName,
          xTickValue: groupView.xTickValue,
          replicates: replicates
        };
        this.groups[groupIndex].samples.push(newSample);
      }
    } else {
      let newGroup = {
        name: groupView.groupName,
        countUnit: groupView.countUnit,
        samples: [{
          name: groupView.sampleName,
          xTickValue: groupView.xTickValue,
          replicates: replicates
        }]
      };
      this.groups.push(newGroup);
    }
  }

  /* PLOTS */

  @action addBarPlot(accessionId, showlegend, plotType){
    /**
     * {
     *   [groupName]: {
     *      [sampleName]: {
     *        average:,
     *        variance:,
     *      }
     *   }
     * }
     */
    let plotData = {};
    this.groups.forEach(group => {

      plotData[group.name] = {};

      group.samples.forEach(sample => {

        plotData[group.name][sample.name] = {
          average: computeAverage(sample.replicates, accessionId),
        };

        plotData[group.name][sample.name].variance = computeVariance(
          sample.replicates, accessionId, plotData[group.name][sample.name].average
        );

      });

    });

    this.plots.push(
      createBarPlot(plotData, accessionId, showlegend, this.groups[0].countUnit, plotType)
    );


  }

  @action clearPlots () {
    this.plots = [];
  }

}

export class Group {

  /** @type {string} */
  name;

  /** @type {CountUnit} */
  countUnit;

  /** @type {Sample[]} */
  samples;

  constructor (state) {

    this.name = state.name;
    this.countUnit = state.countUnit;
    this.samples = state.samples;
  }
}

export class Sample {
  name;
  xTickValue;

  /** @type {Object<string,number>[]} */
  replicates;
}

export const store = new DataStore(preload);