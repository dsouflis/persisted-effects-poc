import {Injectable} from '@angular/core';
import {Store} from "@ngrx/store";
import {StoreType} from "./state/StoreType";
import {PersistedState} from "./state/events/persisted-state";

const USER_AWARDS_KEY = "Awards";

const EVENTS_STATE_KEY = "Events";

export interface AwardPerProfile {
  id: string,
  acquiredDate?: number,
  criteriaStatuses?: boolean[],
}

const Preferences = {
  async set({value,key}:{ value: string, key: string }) {
    localStorage.setItem('CapacitorStorage.' + key, value);
    return;
  },
  async get({key}: { key: string }) {
    const value = localStorage.getItem('CapacitorStorage.' + key);
    return {value};
  }
}

@Injectable({ providedIn: 'root' })
export class DeviceInfoService {
  userAwards: AwardPerProfile[] = [];

    constructor(
      private store: Store<StoreType>,
    ) {
      this.getUserAwardsFromPref().then((u) => this.userAwards = u);
    }

  async setPersistedEventStateOnPref(persistedState: PersistedState) {
    await Preferences.set({
      key: EVENTS_STATE_KEY,
      value: JSON.stringify(persistedState),
    });
  }

  async getPersistedEventStateFromPref(): Promise<PersistedState|undefined> {
    const {value} =  await Preferences.get({key: EVENTS_STATE_KEY});
    if(value){
      return JSON.parse(value) as PersistedState;
    }
    return undefined;
  }

  async setUserAwardsOnPref(userAwards: AwardPerProfile[]) {
      await Preferences.set({
        key: USER_AWARDS_KEY,
        value: JSON.stringify(userAwards),
      });
      // this.store.dispatch(UserApiActions.getProfileAwards());
  }

  async setAwardConditionOnPref(kind: string, ordinal: number) {
    console.log('In setAwardConditionOnPref',this.userAwards);
    let found = this.userAwards.find(a => a.id === kind);
    if (found) {
      if (!found.criteriaStatuses) {
        found.criteriaStatuses = [];
      }
    } else {
      found = {
        id: kind,
        criteriaStatuses: [],
        acquiredDate: undefined,
      };
      this.userAwards = [found, ...this.userAwards];
    }
    const newStatuses = [...found.criteriaStatuses!!];
    newStatuses[ordinal] = true;
    found.criteriaStatuses = newStatuses;
    console.log('In setAwardConditionOnPref Saving',this.userAwards);
    await this.setUserAwardsOnPref(this.userAwards);
  }

  async giveAwardOnPref(kind: string) {
    console.log('In giveAwardOnPref',this.userAwards);
    let found = this.userAwards.find(a => a.id === kind);
    if (!found) {
      found = {
        id: kind,
        criteriaStatuses: [],
        acquiredDate: undefined,
      };
      this.userAwards = [found, ...this.userAwards];
    }
    found.acquiredDate = new Date().getTime();
    console.log('In giveAwardOnPref Saving',this.userAwards);
    await this.setUserAwardsOnPref(this.userAwards);
  }

  async getUserAwardsFromPref(): Promise<AwardPerProfile[]> {
    const {value} =  await Preferences.get({key: USER_AWARDS_KEY});
    if(value) {
      return JSON.parse(value) as AwardPerProfile[];
    }
    return [];
  }

}
