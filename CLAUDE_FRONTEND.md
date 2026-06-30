# 🚗 AI Car Buying Assistant

# CLAUDE_FRONTEND.md

---

# Objective

Build a modern AI-native conversational frontend for helping users choose the right car.

The application should feel similar to ChatGPT, Perplexity or Claude instead of a traditional search form.

The UI should be clean, modern, responsive and focused on conversation.

The frontend communicates only with the Spring Boot backend.

No business logic should exist in React.

React is only responsible for rendering UI and maintaining client state.

---

# Tech Stack

React 19

TypeScript

Vite

TailwindCSS

Axios

React Router

React Icons

Framer Motion

React Markdown

---

# Design Philosophy

Minimal

Modern

Responsive

AI First

Clean White Theme

Soft Shadows

Rounded Components

Large White Space

Professional

Inspired by

ChatGPT

Perplexity

Claude

CarDekho

---

# Color Palette

Primary

#2563EB

Secondary

#EFF6FF

Background

#F8FAFC

Cards

White

Success

Green

Warning

Orange

Danger

Red

Text

Gray-900

---

# Application Flow

Landing Page

↓

Start Conversation

↓

Chat Screen

↓

AI asks questions

↓

User replies

↓

AI asks next question

↓

Backend returns recommendations

↓

Recommendation Screen

↓

Compare Cars

↓

Car Details

---

# Folder Structure

src

components

pages

layouts

hooks

services

types

utils

constants

assets

context

styles

router

---

# Components

AppLayout

Navbar

Footer

ChatWindow

MessageBubble

TypingIndicator

QuickReplyChips

ChatInput

ThinkingAnimation

RecommendationCard

ComparisonTable

CarCard

CarDetailsModal

LoadingSpinner

ErrorBanner

ProgressIndicator

EmptyState

---

# Pages

Home

Chat

Recommendation

CarDetails

NotFound

---

# Home Page

Large Hero Section

Heading

Find Your Perfect Car

Sub Heading

Answer a few questions and let AI recommend the best cars for you.

CTA Button

Start Conversation

Illustration Placeholder

---

# Chat Screen

Looks similar to ChatGPT.

Contains

Conversation

Assistant Messages

User Messages

Typing Indicator

Input Box

Quick Replies

Auto Scroll

Responsive Layout

---

# Chat Messages

Assistant Messages

Blue Background

Rounded

Avatar

Markdown Support

User Messages

Right Aligned

Gray Background

---

# Input

Text Box

Send Button

Enter to Send

Disable while loading

Auto Focus

Character Limit

---

# Quick Reply Chips

Whenever backend asks

Fuel Type

Display

Petrol

Diesel

EV

Hybrid

Not Sure

Whenever backend asks

Transmission

Display

Manual

Automatic

Either

Whenever backend asks

Body Type

Display

SUV

Sedan

Hatchback

MUV

Not Sure

Clicking chip sends message.

---

# Thinking Animation

After user replies

Show

Thinking...

Understanding your preferences

Searching database

Comparing cars

Generating recommendations

Animated dots

---

# Recommendation Screen

Heading

Recommended Cars

Top Recommendation

Large Featured Card

Remaining Recommendations

Grid Layout

---

# Recommendation Card

Brand

Model

Variant

Price

Mileage

Safety

Fuel

Transmission

AI Summary

Buttons

View Details

Compare

---

# Comparison Table

Columns

Car 1

Car 2

Car 3

Rows

Price

Mileage

Safety

Fuel

Transmission

Seats

Boot Space

Ground Clearance

Review Score

Engine

Power

---

# Car Details

Modal

Large Image Placeholder

Specifications

Pros

Cons

AI Summary

Close Button

---

# Progress Indicator

Question

2 of 6

Small Progress Bar

Smooth Animation

---

# State Management

Conversation ID

Messages

Recommendations

Selected Car

Thinking

Loading

Error

Current Question

---

# API Layer

Create

api.ts

Use Axios

Base URL from environment variables.

Create methods

startConversation()

sendMessage()

getCars()

getCar()

---

# Environment Variables

VITE_API_BASE_URL

Never hardcode backend URLs.

---

# Routing

/

Home

/chat

Conversation

/recommendation

Recommendations

/car/:id

Car Details

---

# Responsive Design

Desktop

Sidebar Optional

Centered Chat

Tablet

Responsive Cards

Mobile

Full Width

Bottom Input

Scrollable Chat

---

# Animations

Framer Motion

Fade In

Slide Up

Typing Indicator

Card Hover

Smooth Page Transition

---

# Error Handling

Connection Error

Backend Error

Empty Recommendation

Retry Button

Friendly Messages

---

# Accessibility

Keyboard Navigation

Proper Labels

ARIA Support

Visible Focus

Readable Font Sizes

---

# Performance

Lazy Load Pages

Memoize Components

Avoid Unnecessary Renders

Skeleton Loaders

---

# Coding Standards

Reusable Components

No Inline Styles

TypeScript Interfaces

Custom Hooks

Separate API Layer

Small Components

Meaningful Naming

---

# Suggested File Structure

src

components

Chat

Recommendation

Common

pages

services

hooks

context

types

utils

styles

assets

---

# Custom Hooks

useConversation

useChat

useRecommendations

useTyping

---

# TypeScript Models

ChatMessage

Conversation

Recommendation

Car

ChatRequest

ChatResponse

---

# Claude Code Guidelines

Implement milestone by milestone.

Never generate the complete application in one response.

Milestone 1

Project Setup

Milestone 2

Routing

Milestone 3

Layout

Milestone 4

Home Page

Milestone 5

Chat Screen

Milestone 6

API Integration

Milestone 7

Recommendation Cards

Milestone 8

Comparison Table

Milestone 9

Animations

Milestone 10

Responsive Design

Milestone 11

Refactoring

Milestone 12

Production Ready

Stop after every milestone.

Wait for approval.

---

# Final Goal

The final UI should feel like a production AI assistant rather than a simple car search application.

Users should feel as if they are talking to a knowledgeable automotive expert that guides them towards the best buying decision.

Focus on simplicity, clarity, responsiveness and an enjoyable conversational experience.