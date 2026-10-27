"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
  X,
} from "@/components/icons";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "warning" | "success" | "info" | "reminder";
  read: boolean;
  link?: string;
  actionLabel?: string;
}

const initialNotifications: NotificationItem[] = [];

export default function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-xl border p-2.5 transition ${
          isOpen
            ? "border-[#4f8665] bg-[#f2f7f3] text-[#4f8665]"
            : "border-[#e7ece7] bg-white text-[#728078] hover:border-[#c8d8ca] hover:bg-[#f3f7f2] hover:text-[#17221d]"
        }`}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#dc755f] px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-[68px] sm:top-[calc(100%+8px)] z-50 sm:w-[390px] max-h-[85vh] overflow-hidden rounded-2xl border border-[#e2e7e2] bg-white shadow-2xl animate-rise">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e7ece7] bg-[#fafcfa] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-[#17221d]">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#e1f3e6] px-2 py-0.5 text-[10px] font-bold text-[#2d7b4c]">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#4f8665] hover:underline"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={14} /> Tout lire
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-[#829087] hover:bg-[#eceee9]"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-[#e7ece7] px-4 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`border-b-2 py-2.5 px-2 transition ${
                filter === "all"
                  ? "border-[#4f8665] text-[#4f8665]"
                  : "border-transparent text-[#829087] hover:text-[#17221d]"
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`border-b-2 py-2.5 px-2 transition ${
                filter === "unread"
                  ? "border-[#4f8665] text-[#4f8665]"
                  : "border-transparent text-[#829087] hover:text-[#17221d]"
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#f2f4f2]">
            {displayedNotifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#829087]">
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-[#f3f5f1] text-[#829087]">
                  <CheckCircle2 size={20} />
                </div>
                <p className="font-semibold text-[#17221d]">Aucune notification</p>
                <p className="mt-0.5">Vous êtes parfaitement à jour !</p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const isWarning = notif.type === "warning";
                const isSuccess = notif.type === "success";
                const isInfo = notif.type === "info";

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`group relative flex items-start gap-3 p-3.5 transition hover:bg-[#f9faf7] cursor-pointer ${
                      !notif.read ? "bg-[#f8fbf9]" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                        isWarning
                          ? "bg-[#fbe4e0] text-[#b25247]"
                          : isSuccess
                          ? "bg-[#e1f3e6] text-[#2d7b4c]"
                          : isInfo
                          ? "bg-[#e4eef8] text-[#3c6c91]"
                          : "bg-[#fbefdb] text-[#ba8540]"
                      }`}
                    >
                      {isWarning ? (
                        <AlertCircle size={16} />
                      ) : isSuccess ? (
                        <Check size={16} />
                      ) : isInfo ? (
                        <FileText size={16} />
                      ) : (
                        <Clock size={16} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            !notif.read ? "text-[#17221d]" : "text-[#55635a]"
                          }`}
                        >
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#4f8665]" />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#728078]">
                        {notif.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-[#9aa69e]">{notif.time}</span>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => {
                              markAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="text-[11px] font-bold text-[#4f8665] hover:underline"
                          >
                            {notif.actionLabel ?? "Ouvrir"} →
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      aria-label="Supprimer"
                      className="opacity-0 group-hover:opacity-100 transition rounded p-1 text-[#9aa69e] hover:bg-[#f3f5f1] hover:text-[#b25247]"
                      title="Supprimer la notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#e7ece7] bg-[#fafcfa] px-4 py-2.5 text-center">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#829087] hover:text-[#4f8665]"
            >
              Gérer les préférences de notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
