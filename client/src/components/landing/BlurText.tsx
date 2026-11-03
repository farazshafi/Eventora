import { motion, useReducedMotion } from 'framer-motion';

export function BlurText({
  text,
  delay = 0,
  className = '',
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <span className={className}>{text}</span>;
  return (
    <span aria-label={text} className={className}>
      {text.split(' ').map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="mr-[0.27em] inline-block"
          initial={{ opacity: 0, filter: 'blur(10px)', y: 8 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.65, delay: delay + index * 0.055, ease: 'easeOut' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
