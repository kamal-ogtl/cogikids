// Lottie animation source paths.
// Drop the .json files from lottiefiles.com into src/animations/lottie/

export const LOTTIE = {
  owlIdle:        require('./lottie/owl-idle.json'),
  owlSpeak:       require('./lottie/owl-speak.json'),
  owlCelebrate:   require('./lottie/owl-celebrate.json'),
  correctBurst:   require('./lottie/correct-burst.json'),
  wrongShake:     require('./lottie/wrong-shake.json'),
  levelUp:        require('./lottie/levelup-ceremony.json'),
} as const;
