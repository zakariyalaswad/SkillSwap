import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { Header } from "../header/header";
import { Footer } from "../footer/footer";

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatarGradient: string;
}

interface Stats {
  activeUsers: number;
  skillsShared: number;
  successfulSwaps: number;
  avgRating: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './home.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Home {
  stats = signal<Stats>({
    activeUsers: 2500,
    skillsShared: 150,
    successfulSwaps: 1200,
    avgRating: 4.8
  });

  features = signal<Feature[]>([
    {
      icon: '🤝',
      title: 'Smart Matching',
      description: 'Our intelligent algorithm connects you with the perfect skill exchange partners based on your interests and expertise.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🎯',
      title: 'No Money, Just Skills',
      description: 'Exchange skills directly without any monetary transactions. Share what you know, learn what you want.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '⭐',
      title: 'Trust & Safety',
      description: 'Verified profiles, ratings, and reviews ensure you connect with reliable and trustworthy learning partners.',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: '📱',
      title: 'Real-time Chat',
      description: 'Communicate seamlessly with built-in messaging to schedule sessions and coordinate your skill exchanges.',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: '🏆',
      title: 'Track Progress',
      description: 'Monitor your learning journey, completed swaps, and skills acquired with our comprehensive dashboard.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Connect with talented individuals from around the world and expand your knowledge horizons.',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ]);

  steps = signal<Step[]>([
    {
      number: 1,
      title: 'Create Your Profile',
      description: 'Sign up in seconds and tell us about your skills and what you want to learn. Add your expertise, experience level, and availability to help others find you.'
    },
    {
      number: 2,
      title: 'Find Your Match',
      description: 'Browse through our community or let our smart matching system find the perfect exchange partners for you. Filter by skills, location, and availability.'
    },
    {
      number: 3,
      title: 'Start Learning',
      description: 'Connect, chat, and schedule your first skill exchange session. Share knowledge, learn new skills, and build lasting connections in our community.'
    }
  ]);

  testimonials = signal<Testimonial[]>([
    {
      name: 'Sarah Johnson',
      role: 'Graphic Designer',
      quote: 'SkillSwap changed my life! I learned web development while teaching design. The community is amazing and supportive.',
      avatarGradient: 'from-pink-500 to-rose-500'
    },
    {
      name: 'Michael Chen',
      role: 'Software Developer',
      quote: 'Best platform for skill exchange. I have met incredible people and learned photography while helping others with coding.',
      avatarGradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Emma Williams',
      role: 'Language Teacher',
      quote: 'The matching system is brilliant! I have taught Spanish to 5 people and learned guitar, cooking, and digital marketing.',
      avatarGradient: 'from-purple-500 to-indigo-500'
    }
  ]);

  scrollToFeatures() {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToHowItWorks() {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  }

  navigateToSignup() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const signupBtn = document.querySelector('[data-signup-trigger]') as HTMLElement;
      signupBtn?.click();
    }, 300);
  }
}
