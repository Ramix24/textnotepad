"use client"

import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0.9, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const fadeIn = {
  initial: { opacity: 0.9 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
}

const slideInLeft = {
  initial: { opacity: 0.9, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
}

const slideInRight = {
  initial: { opacity: 0.9, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
}

export const MotionDiv = motion.div
export const MotionSection = motion.section

export const animations = {
  fadeInUp,
  fadeIn,
  slideInLeft,
  slideInRight
}