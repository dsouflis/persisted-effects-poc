import {Subject} from "rxjs";
import {Actions} from "@ngrx/effects";
import {Action, Store, StoreModule} from "@ngrx/store";
import {TestBed} from "@angular/core/testing";
import {EventEffects} from "./event-effects";
import {AwardsActions, BehaviorActions} from "./event-actions";
import {StoreType} from "../StoreType";

describe('The Behavior Effects', () => {
  let effects: EventEffects;
  let actionSubject: Subject<any>;
  let actions$: Actions;
  let store: Store<StoreType>;

  async function commonConfig() {
    TestBed.configureTestingModule({
      imports:[
        StoreModule.forRoot({}),
      ],
      providers: [
        EventEffects,
      ]
    });
    actionSubject = new Subject();
    actions$ = TestBed.inject(Actions);
    store = TestBed.inject(Store);
    window.localStorage.setItem('CapacitorStorage.Awards',"[]");
    // window.localStorage.removeItem('CapacitorStorage.Events');
    effects = TestBed.inject(EventEffects);
    await effects.init();
    actionSubject.subscribe((a) => {
      // console.log('Dispatching',a);
      store.dispatch(a);
    });
    actions$.subscribe((a) => console.log('Action:', a));
  }

  // beforeEach(() => {
  //   commonConfig();
  // });

  describe('on cold start', () => {
    beforeEach(async () => {
      window.localStorage.removeItem('CapacitorStorage.Events');
      await commonConfig();
    });

    it('articleExplorer should work', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('6');
        },
        null,
        () => {
          expect(got).toBeTruthy();
          expect(effects.persistedState.articleExplorerState).toHaveSize(4);
        });
      actionSubject.next(BehaviorActions.articleRead({id: '1', category: 'a'}));
      actionSubject.next(BehaviorActions.articleRead({id: '2', category: 'b'}));
      actionSubject.next(BehaviorActions.articleRead({id: '3', category: 'b'}));
      actionSubject.next(BehaviorActions.articleRead({id: '4', category: 'a'}));
      actionSubject.next(BehaviorActions.articleRead({id: '5', category: 'c'}));
      actionSubject.next(BehaviorActions.articleRead({id: '6', category: 'd'}));
      actionSubject.complete();
    });

    it('quizMaster should work', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('7');
        },
        null,
        () => {
          expect(got).toBeTruthy();
          expect(effects.persistedState.quizMasterState).toHaveSize(4);
        });
      actionSubject.next(BehaviorActions.quizFinished({id: '1', category: 'b'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '2', category: 'a'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '3', category: 'b'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '4', category: 'a'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '5', category: 'c'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '6', category: 'd'}));
      actionSubject.complete();
    });

    it('goalCrusher should work', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('8');
        },
        null,
        () => {
          expect(got).toBeTruthy();
          expect(effects.persistedState.goalCrusherState).toBe(3);
        });
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: true}));
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: true}));
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: false}));
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: true}));
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: true}));
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: true}));
      actionSubject.complete();
    });

    it('screeningAmbassador/serialLearner should work', () => {
      let got5 = false;
      let got12 = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          if (kind === '5') {
            got5 = true;
          }
          if (kind === '12') {
            got12 = true;
          }
          console.log(`Got ${kind}`);
          expect(['5','12']).toContain(kind);
        },
        null,
        () => {
          expect(got5).toBeTruthy();
          expect(got12).toBeTruthy();
          expect(effects.persistedState.screeningAmbassadorArticles).toBe(2);
          expect(effects.persistedState.screeningAmbassadorQuizzes).toBe(1);
        });
      actionSubject.next(BehaviorActions.articleRead({id: '7', category: '30'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '9', category: '30'}));
      actionSubject.next(BehaviorActions.articleRead({id: '8', category: '30'}));
      actionSubject.complete();
    });

    it('superAware should work', () => {
      let got6 = false;
      let got7 = false;
      let got9 = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          if (kind === '6') {
            got6 = true;
          }
          if (kind === '7') {
            got7 = true;
          }
          if (kind === '9') {
            got9 = true;
          }
          console.log(`Got ${kind}`);
          expect(['6', '7', '9']).toContain(kind);
        },
        null,
        () => {
          expect(got6).toBeTruthy();
          expect(got7).toBeTruthy();
          expect(got9).toBeTruthy();
        });
      actionSubject.next(AwardsActions.grantAward({kind: '6'}));
      actionSubject.next(AwardsActions.grantAward({kind: '7'}));
      actionSubject.next(BehaviorActions.hasSuggestedGoals({exist: true}));
      actionSubject.complete();
    });

    it('superAware should work no matter how many times the goals page is visited', () => {
      let got6 = false;
      let got7 = false;
      let got9 = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          if (kind === '6') {
            got6 = true;
          }
          if (kind === '7') {
            got7 = true;
          }
          if (kind === '9') {
            got9 = true;
          }
          console.log(`Got ${kind}`);
          expect(['6', '7', '9']).toContain(kind);
        },
        null,
        () => {
          expect(got6).toBeTruthy();
          expect(got7).toBeTruthy();
          expect(got9).toBeTruthy();
        });
      actionSubject.next(AwardsActions.grantAward({kind: '6'}));
      actionSubject.next(BehaviorActions.hasSuggestedGoals({exist: false}));
      actionSubject.next(AwardsActions.grantAward({kind: '7'}));
      actionSubject.next(BehaviorActions.hasSuggestedGoals({exist: true}));
      actionSubject.complete();
    });

    it('serialLearner should work', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('12');
        },
        null,
        () => {
          expect(got).toBeTruthy();
          expect(effects.persistedState.serialLearnerArticles).toBe(2);
          expect(effects.persistedState.serialLearnerQuizzes).toBe(1);
        });
      actionSubject.next(BehaviorActions.articleRead({id: '9', category: 'a'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '10', category: 'a'}));
      actionSubject.next(BehaviorActions.articleRead({id: '10', category: 'a'}));
      actionSubject.complete();
    });

    it('serialLearner should reset on new session', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('12');
        });
      actionSubject.subscribe((a) => {
        if (a.type === '[Behavior] sessionStarted') {
          console.log('Reseter will be called');
          effects.serialLearnerReseter.reset();
          console.log('Reseter called');
        }
      });

      actionSubject.next(BehaviorActions.articleRead({id: '11', category: 'a'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '11', category: 'a'}));
      actionSubject.next(BehaviorActions.sessionStarted());
      actionSubject.next(BehaviorActions.articleRead({id: '12', category: 'a'}));
      expect(got).toBeFalse();
      actionSubject.next(BehaviorActions.articleRead({id: '13', category: 'a'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '12', category: 'a'}));
      actionSubject.complete();
      expect(got).toBeTrue();
    });

    it('superAware should work after article explorer and quiz master', () => {
      let got6 = false;
      let got7 = false;
      let got9 = false;
      let got12 = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          if (kind === '6') {
            got6 = true;
          }
          if (kind === '7') {
            got7 = true;
          }
          if (kind === '9') {
            got9 = true;
          }
          if (kind === '12') {
            got12 = true;
          }
          console.log(`Got ${kind}`);
          expect(['6', '7', '9', '12']).toContain(kind);
        },
        null,
        () => {
          expect(got6).toBeTruthy();
          expect(got7).toBeTruthy();
          expect(got9).toBeTruthy();
          expect(got12).toBeTruthy();
        });

      actionSubject.next(BehaviorActions.quizFinished({id: '13', category: 'b'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '14', category: 'a'}));
      actionSubject.next(BehaviorActions.articleRead({id: '14', category: 'a'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '15', category: 'a'}));
      actionSubject.next(BehaviorActions.articleRead({id: '15', category: 'a'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '16', category: 'c'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '17', category: 'd'}));
      actionSubject.next(BehaviorActions.articleRead({id: '16', category: 'b'}));
      actionSubject.next(BehaviorActions.articleRead({id: '17', category: 'b'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '18', category: 'b'}));
      actionSubject.next(BehaviorActions.articleRead({id: '18', category: 'c'}));
      actionSubject.next(BehaviorActions.articleRead({id: '19', category: 'd'}));

      actionSubject.next(BehaviorActions.hasSuggestedGoals({exist: true}));
      actionSubject.complete();
    });

  });

  describe('on warm start', async () => {
    beforeEach(async () => {
      let persistedState = {
        articleExplorerState: ['a', 'b'],
        quizMasterState: ['a', 'b'],
        goalCrusherState: 2,
        screeningAmbassadorArticles: 1,
        screeningAmbassadorQuizzes: 0,
        screeningAmbassadorZipState: {
          buffers: [[1], []],
          completed: [false, false],
        },
        serialLearnerArticles: 1,
        serialLearnerQuizzes: 0,
        serialLearnerSession: 0,
        serialLearnerZipState: {
          buffers: [[1], []],
          completed: [false, false],
        },
        superAwareArticleExplorerAward: 1,
        superAwareQuizMasterAward: 0,
        superAwareZipState: {
          buffers: [[1], [1], []],
          completed: [true, true, false],
        },
      };
      window.localStorage.setItem('CapacitorStorage.Events', JSON.stringify(persistedState));
      console.log('Ensured saved state');

      console.log('beforeEach done');
      await commonConfig();
      // effects.persistedState = persistedState;
      // actionSubject.subscribe((a) => console.log('Action:', a));
    });

    it('articleExplorer should work', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
        if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('6');
        },
        null,
        () => {
          expect(got).toBeTruthy();
          expect(effects.persistedState.articleExplorerState).toHaveSize(4);
        });
      actionSubject.next(BehaviorActions.articleRead({id: '1', category: 'a'}));
      actionSubject.next(BehaviorActions.articleRead({id: '1', category: 'c'}));
      actionSubject.next(BehaviorActions.articleRead({id: '1', category: 'd'}));
      actionSubject.complete();
    });

    it('quizMaster should work', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward' || kind != 7) return; //ignore serial learner & super aware
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('7');
        },
        null,
        () => {
          expect(got).toBeTruthy();
          expect(effects.persistedState.quizMasterState).toHaveSize(4);
        });
      actionSubject.next(BehaviorActions.quizFinished({id: '19', category: 'a'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '20', category: 'c'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '21', category: 'd'}));
      actionSubject.complete();
    });

    it('goalCrusher should work', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('8');
        },
        null,
        () => {
          expect(got).toBeTruthy();
          expect(effects.persistedState.goalCrusherState).toBe(3);
        });
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: true}));
      actionSubject.complete();
    });

    it('goalCrusher should start from scratch when a goal fails', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).not.toBe('8');
        },
        null,
        () => {
          expect(got).toBeFalse();
          expect(effects.persistedState.goalCrusherState).toBe(1);
        });
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: false}));
      actionSubject.next(BehaviorActions.goalFinished({category: 'b', success: true}));
      actionSubject.complete();
    });

    it('screeningAmbassador/serialLearner should work', () => {
      let got5 = false;
      let got12 = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          if (kind === '5') {
            got5 = true;
          }
          if (kind === '12') {
            got12 = true;
          }
          console.log(`Got ${kind}`);
          expect(['5','12', '7', '9']).toContain(kind);
        },
        null,
        () => {
          expect(got5).toBeTruthy();
          expect(got12).toBeTruthy();
          expect(effects.persistedState.screeningAmbassadorArticles).toBe(2);
          expect(effects.persistedState.screeningAmbassadorQuizzes).toBe(1);
        });
      actionSubject.next(BehaviorActions.articleRead({id: '20', category: '30'}));
      actionSubject.next(BehaviorActions.quizFinished({id: '22', category: '30'}));
      actionSubject.complete();
    });

    it('superAware should work', () => {
      let got7 = false;
      let got9 = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          if (kind === '7') {
            got7 = true;
          }
          if (kind === '9') {
            got9 = true;
          }
          console.log(`Got ${kind}`);
          expect(['7', '9']).toContain(kind);
        },
        null,
        () => {
          expect(got7).toBeTruthy();
          expect(got9).toBeTruthy();
        });
      actionSubject.next(AwardsActions.grantAward({kind: '7'}));
      actionSubject.complete();
    });

  });

  describe('on warm start with two articles already read', () => {
    beforeEach(async () => {
      let persistedState = {

        articleExplorerState: [],
        quizMasterState: [],
        goalCrusherState: 0,
        serialLearnerArticles: 0,
        serialLearnerQuizzes: 0,
        serialLearnerSession: 0,
        serialLearnerZipState: {
          buffers: [0,1].map(() => []),
          completed: [0,1].map(() => false),
        },
        superAwareArticleExplorerAward: 0,
        superAwareQuizMasterAward: 0,
        superAwareZipState: {
          buffers: [0,1,2].map(() => []),
          completed: [0,1,2].map(() => false),
        },
        screeningAmbassadorArticles: 2,
        screeningAmbassadorQuizzes: 0,
        screeningAmbassadorZipState: {
          buffers: [[2], []],
          completed: [true, false],
        }
      };
      window.localStorage.setItem('CapacitorStorage.Events', JSON.stringify(persistedState));
      await commonConfig();

      // effects.persistedState = persistedState;
      // actionSubject.subscribe((a) => console.log('Action:', a));
    });

    it('screeningAmbassador should work', () => {
      let got = false;
      actions$.subscribe(({type, kind}:Action&any) => {
          if(type !== '[Awards] grantAward') return;
          got = true;
          console.log(`Got ${kind}`);
          expect(kind).toBe('5');
        },
        null,
        () => {
          expect(got).toBeTruthy();
          expect(effects.persistedState.screeningAmbassadorArticles).toBe(2);
          expect(effects.persistedState.screeningAmbassadorQuizzes).toBe(1);
        });
      actionSubject.next(BehaviorActions.quizFinished({id: '23', category: '30'}));
      actionSubject.complete();
    });
  });
})
