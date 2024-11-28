#!/bin/bash
export TSC_COMPILE_ON_ERROR=true
export DISABLE_ESLINT_PLUGIN=true
export CI=false
npm run build
