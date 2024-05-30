export interface PersistedState {
  articleExplorerState: string[],
  quizMasterState: string[],
  goalCrusherState: number,
  screeningAmbassadorArticles: number,
  screeningAmbassadorQuizzes: number,
  screeningAmbassadorZipState: {
    buffers: any[][],
    completed: boolean[],
  },
  serialLearnerArticles: number,
  serialLearnerQuizzes: number,
  serialLearnerSession: number,
  serialLearnerZipState: {
    buffers: any[][],
    completed: boolean[],
  },
  superAwareArticleExplorerAward: number,
  superAwareQuizMasterAward: number,
  superAwareZipState: {
    buffers: any[][],
    completed: boolean[],
  },
}
