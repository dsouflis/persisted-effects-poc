 import {Injectable} from "@angular/core";
import {Actions, ofType} from "@ngrx/effects";
import {Action, Store} from "@ngrx/store";
import {delay, filter, map, Observable, of, pipe, switchMap, take, tap, UnaryFunction} from "rxjs";
import {AwardsActions, BehaviorActions} from "./event-actions";
import {PersistedEffectsBase, Reseter} from "./PersistedEffectsBase";
import {awardSetup} from "../../award-setup";
import {StoreType} from "../StoreType";
import {DeviceInfoService} from "../../deviceInfo.service";
import {PersistedState} from "./persisted-state";

const {
  articleExplorerRequiredNumberOfCategories,
  articleExplorerAwardKind,
  quizMasterRequiredNumberOfCategories,
  quizMasterAwardKind,
  goalCrusherGoalsInARow,
  goalCrusherAwardKind,
  screeningAmbassadorRequiredNumberOfArticles,
  screeningAmbassadorRequiredNumberOfQuizzes,
  screeningAmbassadorRequiredCategory,
  screeningAmbassadorAwardKind,
  superAwareAwardKind,
  serialLearnerAwardKind,
  freshmanDuration,
  freshmanAwardKind,
} = awardSetup;

@Injectable()
export class EventEffects extends PersistedEffectsBase {
  initialState: PersistedState = {
    articleExplorerState: [],
    quizMasterState: [],
    goalCrusherState: 0,
    screeningAmbassadorArticles: 0,
    screeningAmbassadorQuizzes: 0,
    screeningAmbassadorZipState: {
      buffers: [0,1].map(() => []),
      completed: [0,1].map(() => false),
    },
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
  };
  persistedState: PersistedState = {
    ...JSON.parse(JSON.stringify(this.initialState)) as PersistedState,
  };

  persist(label: string, state: any) {
    // console.log(`Persisted ${label}:`, state && (state[Symbol.iterator] ? [...state] : JSON.stringify(state)));
    (this.persistedState as any)[label] = state;
    this.deviceInfoService.setPersistedEventStateOnPref(this.persistedState).then(
      ()=> console.log(`Saved persisted state ${label}:`, state && (state[Symbol.iterator] ? [...state] : JSON.stringify(state))),
      (e) => console.log('Error in setPersistedEventStateOnPref', e)
      );
    return state;
  }

  state(label: string) {
    let stateElement = (this.persistedState as any)[label];
    console.log(`Init ${label} with :`, stateElement && (stateElement[Symbol.iterator] ? [...stateElement] : JSON.stringify(stateElement)));
    return stateElement;
  }

  zeroState(label: string): any {
    let stateElement = (this.initialState as any)[label];
    console.log(`Zero ${label} with :`, stateElement && (stateElement[Symbol.iterator] ? [...stateElement] : JSON.stringify(stateElement)));
    return stateElement;  }

  constructor(
    private actions$: Actions,
    private store: Store<StoreType>,
    private deviceInfoService: DeviceInfoService,
  ) {
    super();
    // this.init();
  }

  init() {
    this.actions$.pipe(
      ofType(AwardsActions.grantAward),
    ).subscribe(({kind}) => {
      this.deviceInfoService.giveAwardOnPref(kind).then(
        () => console.log('giveAwardOnPref', kind),
        (e) => console.log('Error giveAwardOnPref', kind, e)
      );
    });
    this.actions$.pipe(
      ofType(AwardsActions.satisfiedAwardCondition),
    ).subscribe(({kind, ordinal}) => {
      this.deviceInfoService.setAwardConditionOnPref(kind, 0).then(
        () => console.log('setAwardConditionOnPref', kind, 0),
        (e) => console.log('Error setAwardConditionOnPref', kind, 0, e)
      );
    });
    return this.deviceInfoService.getPersistedEventStateFromPref().then(
      (p) => {
        console.log('Got persisted state', p);
        this.persistedState = p || this.persistedState;
        let dispatchAction = (a: Action) => this.store.dispatch(a);
        this.articleExplorer().subscribe(dispatchAction);
        this.quizMaster().subscribe(dispatchAction);
        this.goalCrusher().subscribe(dispatchAction);
        this.screeningAmbassador().subscribe(dispatchAction);
        this.superAware().subscribe(dispatchAction);
        this.serialLearner().subscribe(dispatchAction);
        this.store.dispatch(BehaviorActions.sessionStarted());
      },
      (e) => console.log('Error in getPersistedEventStateFromPref', e)
    );
  }

  readOneArticleFromEachOf_N_Categories: (label: string, n: number) => UnaryFunction<Observable<Action>, Observable<number>> = (label: string, n: number) => pipe(
    ofType(BehaviorActions.articleRead),
    this.persistedScan(
      label,
      (accum: string[], x) => [...(new Set(accum)).add(x.category)],
    ),
    switchMap(x => of(x.length)),
    filter(x => x >= n),
  );

  articleExplorer = () => this.actions$.pipe(
    this.readOneArticleFromEachOf_N_Categories('articleExplorerState', articleExplorerRequiredNumberOfCategories),
    take(1),
    this.setAwardConditionOnPerf(articleExplorerAwardKind, 0),
    switchMap(_ => of(AwardsActions.grantAward({kind: articleExplorerAwardKind}))),
  );

  completeOneQuizFromEachOf_N_Categories: (label: string, n: number) => UnaryFunction<Observable<Action>, Observable<number>> = (label: string, n: number) => pipe(
    ofType(BehaviorActions.quizFinished),
    this.persistedScan(
      label,
      (accum: string[], x) => [...(new Set(accum)).add(x.category)],
    ),
    map(x => (x.length)),
    filter(x => x >= n),
  );

  quizMaster = () => this.actions$.pipe(
    this.completeOneQuizFromEachOf_N_Categories('quizMasterState', quizMasterRequiredNumberOfCategories),
    take(1),
    this.setAwardConditionOnPerf(quizMasterAwardKind, 0),
    switchMap(_ => of(AwardsActions.grantAward({kind: quizMasterAwardKind}))),
  );

  successfullyAccomplish_N_GoalsInARow: (label: string, n: number) => UnaryFunction<Observable<Action>, Observable<number>> = (label: string, n: number) => pipe(
    ofType(BehaviorActions.goalFinished),
    map(({success}) => success ? ([1, 1]) : ([0, 0])),
    this.persistedScan(
      label,
      (accum: number, [add, mult]) => (accum + add) * mult,
    ),
    filter(x => x >= n),
  );

  goalCrusher = () => this.actions$.pipe(
    this.successfullyAccomplish_N_GoalsInARow('goalCrusherState', goalCrusherGoalsInARow),
    take(1),
    this.setAwardConditionOnPerf(goalCrusherAwardKind, 0),
    switchMap(_ => of(AwardsActions.grantAward({kind: goalCrusherAwardKind}))),
  );

  read_N_articlesFromCategory_C_ = (label: string, n: number, cat: any) => pipe(
    ofType(BehaviorActions.articleRead),
    filter(({category}) => !cat || category === cat),
    map(_ => 1),
    this.persistedScan(
      label,
      (accum: number, x) => accum + 1,
    ),
    filter(x => x >= n),
  );

  complete_N_quizzesFromCategory_C_: (label: string, n: number, cat: any) => UnaryFunction<Observable<Action>, Observable<number>> = (label: string, n: number, cat: any) => pipe(
    ofType(BehaviorActions.quizFinished),
    filter(({category}) => !cat || category === cat),
    map(_ => 1),
    this.persistedScan(
      label,
      (accum: number, x) => accum + 1,
    ),
    filter(x => x >= n),
  );

  screeningAmbassador = () => this.actions$.pipe(
    this.read_N_articlesFromCategory_C_('screeningAmbassadorArticles', screeningAmbassadorRequiredNumberOfArticles, screeningAmbassadorRequiredCategory),
    take(1),
    this.setAwardConditionOnPerf(screeningAmbassadorAwardKind, 0),
    this.persistedZipWith(
      'screeningAmbassadorZipState',
      this.actions$.pipe(
        this.complete_N_quizzesFromCategory_C_('screeningAmbassadorQuizzes', screeningAmbassadorRequiredNumberOfQuizzes, screeningAmbassadorRequiredCategory),
        take(1),
        tap(_ => {
          // let awardCondition = AwardsActions.satisfiedAwardCondition({kind: screeningAmbassadorAwardKind, ordinal: 1, condition: 'Complete 1 quiz'});
          // this.store.dispatch(awardCondition);
          this.deviceInfoService.setAwardConditionOnPref(screeningAmbassadorAwardKind, 1).then(
            () => console.log('setAwardConditionOnPref', screeningAmbassadorAwardKind, 1),
            (e) => console.log('Error setAwardConditionOnPref', screeningAmbassadorAwardKind, 1, e)
          );
        }),
      )
    ),
    switchMap(_ => of(AwardsActions.grantAward({kind: screeningAmbassadorAwardKind})))
  );

  haveNoSuggestedGoals: () => UnaryFunction<Observable<Action>, Observable<number>> = () => pipe(
    ofType(BehaviorActions.hasSuggestedGoals),
    filter(({exist}) => exist),
    map(x => 1),
  );

  win_X_Award: (label: string, awardKind: string) => UnaryFunction<Observable<Action>, Observable<number>> = (label: string, awardKind: string) => pipe(
    ofType(AwardsActions.grantAward),
    filter(({kind}) => kind === awardKind),
    map(_ => 1),
    this.persistedScan(
      label,
      (accum: number, x) => accum + 1,
    ),
    filter(x => x >= 1),
    );

  superAware = () => this.actions$.pipe(
    this.haveNoSuggestedGoals(),
    take(1),
    this.setAwardConditionOnPerf(superAwareAwardKind, 0),
    this.persistedZipWith(
      'superAwareZipState',
      this.actions$.pipe(
        this.win_X_Award('superAwareArticleExplorerAward', articleExplorerAwardKind),
        take(1),
        this.setAwardConditionOnPerf(superAwareAwardKind, 1),
      ),
      this.actions$.pipe(
        this.win_X_Award('superAwareQuizMasterAward', quizMasterAwardKind),
        take(1),
        this.setAwardConditionOnPerf(superAwareAwardKind, 2),
      ),
    ),
    switchMap(_ => of(AwardsActions.grantAward({kind: superAwareAwardKind})))
  );

  serialLearnerReseter = new Reseter();

  serialLearner = () => this.actions$.pipe(
    ofType(BehaviorActions.articleRead),
    map(_ => 1),
    this.persistedScan(
      'serialLearnerArticles',
      (accum: number, x) => (accum + 1),
      this.serialLearnerReseter
    ),
    filter(x => x === 2),
    this.persistedZipWith(
      'serialLearnerZipState',
      this.actions$.pipe(
        ofType(BehaviorActions.quizFinished),
        map(_ => 1),
        this.persistedScan(
          'serialLearnerQuizzes',
          (accum: number, x) => (accum + 1),
          this.serialLearnerReseter
        ),
        filter(x => x === 1),
      )
    ),
    map(_ => 1),
    this.setAwardConditionOnPerf(serialLearnerAwardKind, 0),
    switchMap(x => of(AwardsActions.grantAward({kind: serialLearnerAwardKind})))
  );

  setAwardConditionOnPerf<T>(awardKind: string, ordinal: number): UnaryFunction<Observable<T>, Observable<T>> {
    return  pipe(
      tap(_ => {
        let awardCondition = AwardsActions.satisfiedAwardCondition({kind: articleExplorerAwardKind, ordinal: 0, condition: 'Read 1 article from each category'});
        this.store.dispatch(awardCondition);
      }),
    );
  }
}
