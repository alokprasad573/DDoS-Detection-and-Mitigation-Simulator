import type { ComponentType, SVGProps } from "react";
import {
  Activity,
  AlertTriangle,
  Cpu,
  HeartPulse,
  Shield,
  Sliders,
  Zap,
} from "@/components/ui/icons";

export interface NavRoute {
  href: string;
  label: string;
  sublabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
}

export const NAV_ROUTES: NavRoute[] = [
  {
    href: "/overview",
    label: "Overview",
    sublabel: "Traffic summary & system status",
    icon: Activity,
  },
  {
    href: "/detection",
    label: "Attack Detection",
    sublabel: "Flagged traffic & security events",
    icon: AlertTriangle,
    badge: "AI",
  },
  {
    href: "/models",
    label: "Machine Learning",
    sublabel: "Trained model health & live test",
    icon: Cpu,
  },
  {
    href: "/protection",
    label: "Attack Protection",
    sublabel: "Firewall rules & active defense",
    icon: Shield,
  },
  {
    href: "/simulator",
    label: "Traffic Simulator",
    sublabel: "Safe test traffic generator",
    icon: Zap,
    badge: "Lab",
  },
  {
    href: "/health",
    label: "System Health",
    sublabel: "Service status & audit log",
    icon: HeartPulse,
  },
  {
    href: "/settings",
    label: "Settings",
    sublabel: "Limits & safety rules",
    icon: Sliders,
  },
];
