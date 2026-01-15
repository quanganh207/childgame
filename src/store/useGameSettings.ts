import { create } from "zustand";

type State = {
  soundOn: boolean;
  musicOn: boolean;
  hintsEnabled: boolean;
  setSoundOn: (value: boolean) => void;
  setMusicOn: (value: boolean) => void;
  toggleHints: () => void;
};

export const useGameSettings = create<State>((set) => ({
  soundOn: true,
  musicOn: true,
  hintsEnabled: true,
  setSoundOn: (value) => set({ soundOn: value }),
  setMusicOn: (value) => set({ musicOn: value }),
  toggleHints: () => set((state) => ({ hintsEnabled: !state.hintsEnabled }))
}));
