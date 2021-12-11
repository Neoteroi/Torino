#!/bin/bash -e

die () {
    lightred='\033[1;31m'
    nocolor='\033[0m'
    echo -e "${lightred}${1}${nocolor}" >&2
    exit 2
}

info () {
  lightcyan='\e[96m'
  nocolor='\033[0m'
  echo -e "${lightcyan}${1}${nocolor}" >&2
}

warn () {
  lightcyan='\e[93m'
  nocolor='\033[0m'
  echo -e "${lightcyan}${1}${nocolor}" >&2
}

error () {
  lightred='\033[1;31m'
  nocolor='\033[0m'
  echo -e "${lightred}${1}${nocolor}" >&2
}
