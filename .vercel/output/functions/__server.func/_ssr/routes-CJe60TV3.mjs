import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay$1, c as Slot, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
import { a as Plus, c as Lock, i as Settings, l as ChevronRight, o as MessageSquare, r as Trash2, s as Mail, t as X, u as ChevronLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CJe60TV3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Wordmark({ className, subtitle = "Marketing calendar" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("select-none", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-[1.35rem] leading-none font-medium tracking-[0.22em] text-ink",
			children: "CHIEF"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-[10px] font-medium tracking-[0.28em] text-muted uppercase",
			children: subtitle
		})]
	});
}
/** Parse a YYYY-MM-DD calendar date as local midnight (never UTC). */
function fromISO(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function toISO(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function todayISO() {
	return toISO(/* @__PURE__ */ new Date());
}
function startOfMonth(date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date, n) {
	return new Date(date.getFullYear(), date.getMonth() + n, 1);
}
function daysInMonth(year, monthIndex) {
	return new Date(year, monthIndex + 1, 0).getDate();
}
/** Monday-first cells for a month. Null = leading/trailing spacer. */
function monthCells(year, monthIndex) {
	const lead = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
	const count = daysInMonth(year, monthIndex);
	const cells = [];
	for (let i = 0; i < lead; i += 1) cells.push(null);
	for (let d = 1; d <= count; d += 1) cells.push(d);
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}
function isoInMonth(year, monthIndex, day) {
	return toISO(new Date(year, monthIndex, day));
}
function isInRange(iso, start, end) {
	const t = iso;
	return t >= start && t <= (end ?? start);
}
function rangeLengthDays(start, end) {
	if (!end || end === start) return 1;
	const a = fromISO(start).getTime();
	const b = fromISO(end).getTime();
	return Math.round((b - a) / 864e5) + 1;
}
function formatLong(iso) {
	return fromISO(iso).toLocaleDateString("en-AU", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function formatDayMonth(iso) {
	return fromISO(iso).toLocaleDateString("en-AU", {
		day: "numeric",
		month: "short"
	});
}
function monthTitle(date) {
	return date.toLocaleDateString("en-AU", {
		month: "long",
		year: "numeric"
	});
}
var WEEKDAYS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
function matchesRegion$1(region, filter) {
	if (filter === "ALL") return true;
	return region === filter || region === "BOTH";
}
function MonthGrid({ year, monthIndex, keyDates, campaigns, region, channel, showKeyDates, showSchool, selectedDate, onSelectDate, onEditCampaign, onMoveCampaign }) {
	const cells = monthCells(year, monthIndex);
	const today = todayISO();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7 border-b border-line",
			children: WEEKDAYS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-1 py-2.5 text-center text-2xs font-medium tracking-caps text-muted uppercase",
				children: d
			}, d))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-7",
			children: cells.map((day, i) => {
				if (day === null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-16 border-line bg-bg/40 md:min-h-28" }, `e-${i}`);
				const iso = isoInMonth(year, monthIndex, day);
				const dayKeys = showKeyDates ? keyDates.filter((k) => matchesRegion$1(k.region, region) && isInRange(iso, k.startDate, k.endDate) && (showSchool || k.category !== "school")) : [];
				const school = showSchool ? keyDates.some((k) => k.category === "school" && matchesRegion$1(k.region, region) && isInRange(iso, k.startDate, k.endDate) && rangeLengthDays(k.startDate, k.endDate) <= 21) : false;
				const dayCamps = campaigns.filter((c) => c.sendDate === iso && (channel === "ALL" || c.channel === channel) && matchesRegion$1(c.market, region));
				const isToday = iso === today;
				const isSelected = iso === selectedDate;
				const labelKeys = dayKeys.filter((k) => k.category !== "school").filter((k) => rangeLengthDays(k.startDate, k.endDate) <= 3 || k.startDate === iso);
				const peekKeys = labelKeys.slice(0, 1);
				const peekCamps = dayCamps.slice(0, 2);
				const more = labelKeys.length + dayCamps.length - peekKeys.length - peekCamps.length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "button",
					tabIndex: 0,
					"data-date": iso,
					onClick: () => onSelectDate(iso),
					onKeyDown: (e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							onSelectDate(iso);
						}
					},
					onDragOver: (e) => {
						if (!onMoveCampaign) return;
						e.preventDefault();
						e.dataTransfer.dropEffect = "move";
					},
					onDrop: (e) => {
						if (!onMoveCampaign) return;
						e.preventDefault();
						e.stopPropagation();
						const id = Number(e.dataTransfer.getData("text/plain"));
						const c = campaigns.find((x) => x.id === id);
						if (c) onMoveCampaign(c, iso);
					},
					className: cn("flex min-h-16 flex-col items-start gap-0.5 border-t border-l border-line p-1.5 text-left md:min-h-28 md:p-2", i % 7 === 0 && "border-l-0", school && "bg-school/70", isSelected && "bg-surface-2", "cursor-pointer transition-colors duration-150 hover:bg-surface-2/80"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums", isToday ? "bg-accent font-medium text-accent-fg" : "text-ink"),
							children: day
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden w-full flex-col gap-0.5 md:flex",
							children: [
								peekKeys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-2xs leading-tight text-muted italic",
									children: k.name
								}, k.id)),
								peekCamps.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									draggable: Boolean(onMoveCampaign),
									onClick: (e) => {
										e.stopPropagation();
										onEditCampaign?.(c);
									},
									onDragStart: (e) => {
										e.dataTransfer.setData("text/plain", String(c.id));
										e.dataTransfer.effectAllowed = "move";
									},
									className: cn("truncate rounded-xs px-1 py-0.5 text-left text-2xs font-medium leading-tight", c.channel === "EDM" ? "bg-accent text-accent-fg" : "bg-clay text-clay-fg"),
									children: [
										c.channel,
										" ",
										c.title
									]
								}, c.id)),
								more > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-2xs text-subtle",
									children: ["+", more]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto flex flex-wrap gap-0.5 md:hidden",
							children: [dayCamps.slice(0, 3).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", c.channel === "EDM" ? "bg-accent" : "bg-clay") }, c.id)), dayCamps.length === 0 && peekKeys.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-subtle" }) : null]
						})
					]
				}, iso);
			})
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide", {
	variants: { variant: {
		edm: "bg-accent text-accent-fg",
		sms: "bg-clay text-clay-fg",
		au: "bg-surface-2 text-ink",
		us: "bg-surface-2 text-ink",
		both: "bg-surface-2 text-muted",
		draft: "bg-surface-2 text-muted",
		scheduled: "bg-accent/15 text-accent",
		sent: "bg-sent/20 text-accent",
		public: "bg-transparent text-muted",
		school: "bg-school text-ink",
		retail: "bg-transparent text-clay",
		cultural: "bg-transparent text-muted",
		sporting: "bg-transparent text-ink",
		mute: "bg-surface-2 text-muted"
	} },
	defaultVariants: { variant: "mute" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:bg-accent/90",
			secondary: "bg-surface-2 text-ink hover:bg-line",
			outline: "border border-line bg-surface text-ink hover:bg-surface-2",
			ghost: "text-ink hover:bg-surface-2",
			danger: "bg-danger text-danger-fg hover:bg-danger/90"
		},
		size: {
			default: "h-11 rounded-md px-4",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-12 rounded-md px-5",
			icon: "size-11 rounded-md",
			"icon-sm": "size-9 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function categoryLabel(c) {
	if (c === "public") return "Holiday";
	if (c === "school") return "School";
	if (c === "retail") return "Retail";
	if (c === "sporting") return "Sport";
	return "Cultural";
}
function DayPanel({ date, keyDates, campaigns, onAdd, onEdit, onAddKeyDate, onDeleteKeyDate }) {
	const dayKeys = keyDates.filter((k) => isInRange(date, k.startDate, k.endDate));
	const dayCamps = campaigns.filter((c) => c.sendDate === date);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xs font-medium tracking-caps text-muted uppercase",
					children: "Day"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-2xl leading-tight font-medium tracking-tight",
					children: formatLong(date)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: onAdd,
					"data-testid": "add-campaign-day",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Campaign"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-2xs font-medium tracking-caps text-muted uppercase",
						children: "Key dates"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onAddKeyDate,
						className: "text-xs text-muted underline-offset-2 hover:text-ink hover:underline",
						children: "Add date"
					})]
				}), dayKeys.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-subtle",
					children: "Nothing pinned to this day."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: dayKeys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-md border border-line bg-bg px-3 py-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-ink",
									children: k.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex flex-wrap items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: k.category,
											children: categoryLabel(k.category)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: k.region === "US" ? "us" : k.region === "AU" ? "au" : "both",
											children: k.region === "BOTH" ? "AU + US" : k.region
										}),
										rangeLengthDays(k.startDate, k.endDate) > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-2xs text-subtle",
											children: [
												k.startDate,
												" – ",
												k.endDate
											]
										}) : null
									]
								}),
								k.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-xs leading-relaxed text-muted",
									children: k.notes
								}) : null
							] }), !k.isSystem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onDeleteKeyDate(k.id),
								className: "rounded-sm p-2 text-subtle hover:bg-surface-2 hover:text-danger",
								"aria-label": `Remove ${k.name}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
							}) : null]
						})
					}, k.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-2xs font-medium tracking-caps text-muted uppercase",
					children: "Campaigns"
				}), dayCamps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-subtle",
					children: "No EDM or SMS on this day yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: dayCamps.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onEdit(c),
						className: "w-full rounded-md border border-line bg-bg px-3 py-2.5 text-left transition-colors hover:bg-surface-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									c.channel === "EDM" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-3.5 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3.5 text-clay" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium text-ink",
										children: c.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: c.channel === "EDM" ? "edm" : "sms",
										className: "ml-auto",
										children: c.channel
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1.5 flex flex-wrap gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: c.status,
										children: c.status
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: c.market === "BOTH" ? "both" : c.market === "US" ? "us" : "au",
										children: c.market === "BOTH" ? "AU + US" : c.market
									}),
									c.sendTime ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xs tabular-nums text-subtle",
										children: c.sendTime
									}) : null
								]
							}),
							c.subject ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("mt-1.5 truncate text-xs text-muted"),
								children: c.subject
							}) : null
						]
					}) }, c.id))
				})]
			})
		]
	});
}
function matchesRegion(region, filter) {
	if (filter === "ALL") return true;
	return region === filter || region === "BOTH";
}
function Upcoming({ keyDates, campaigns, region, channel, showKeyDates, onOpenDate }) {
	const today = todayISO();
	const horizon = /* @__PURE__ */ new Date();
	horizon.setDate(horizon.getDate() + 60);
	const until = toISO(horizon);
	const camps = campaigns.filter((c) => c.sendDate >= today && c.sendDate <= until && (channel === "ALL" || c.channel === channel) && matchesRegion(c.market, region)).slice(0, 8);
	const dates = showKeyDates ? keyDates.filter((k) => matchesRegion(k.region, region) && k.category !== "school" && k.startDate >= today && k.startDate <= until).slice(0, 8) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xs font-medium tracking-caps text-muted uppercase",
			children: "Upcoming sends"
		}), camps.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-subtle",
			children: "No campaigns in the next 60 days."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-1",
			children: camps.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onOpenDate(c.sendDate),
				className: "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-12 shrink-0 pt-0.5 text-2xs tabular-nums text-muted",
						children: formatDayMonth(c.sendDate)
					}),
					c.channel === "EDM" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "mt-0.5 size-3.5 shrink-0 text-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "mt-0.5 size-3.5 shrink-0 text-clay" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm text-ink",
							children: c.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-2xs text-subtle",
							children: [
								c.channel,
								" · ",
								c.market,
								" · ",
								c.status
							]
						})]
					})
				]
			}) }, c.id))
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xs font-medium tracking-caps text-muted uppercase",
			children: "Dates to plan around"
		}), dates.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-subtle",
			children: "No upcoming key dates in view."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-1",
			children: dates.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onOpenDate(k.startDate),
				className: "flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-12 shrink-0 pt-0.5 text-2xs tabular-nums text-muted",
					children: formatDayMonth(k.startDate)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-sm text-ink",
						children: k.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 inline-flex items-center gap-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: k.region === "BOTH" ? "both" : k.region === "US" ? "us" : "au",
							children: k.region === "BOTH" ? "AU + US" : k.region
						})
					})]
				})]
			}) }, k.id))
		})] })]
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink shadow-none", "placeholder:text-subtle", "transition-[border-color,box-shadow] duration-150 ease-out", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:border-accent", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-xs font-medium tracking-wide text-muted", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink", "placeholder:text-subtle", "transition-[border-color,box-shadow] duration-150 ease-out", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:border-accent", "disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
var empty = (date) => ({
	title: "",
	channel: "EDM",
	sendDate: date,
	sendTime: "09:00",
	market: "AU",
	status: "draft",
	subject: "",
	audience: "",
	notes: "",
	keyDateId: null
});
function fromCampaign(c) {
	return {
		title: c.title,
		channel: c.channel,
		sendDate: c.sendDate,
		sendTime: c.sendTime || "09:00",
		market: c.market,
		status: c.status,
		subject: c.subject,
		audience: c.audience,
		notes: c.notes,
		keyDateId: c.keyDateId
	};
}
function Segment({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex rounded-md bg-surface-2 p-1",
		children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(opt.value),
			className: cn("h-9 flex-1 rounded-sm px-2 text-xs font-medium transition-colors duration-150", value === opt.value ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted hover:text-ink"),
			children: opt.label
		}, opt.value))
	});
}
function CampaignForm({ initial, date, keyDates, pending, onSubmit, onDelete }) {
	const [form, setForm] = (0, import_react.useState)(initial ? fromCampaign(initial) : empty(date));
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const dayDates = keyDates.filter((k) => {
		const end = k.endDate ?? k.startDate;
		return form.sendDate >= k.startDate && form.sendDate <= end;
	});
	function set(key, value) {
		setForm((prev) => ({
			...prev,
			[key]: value
		}));
	}
	async function handleSubmit(e) {
		e.preventDefault();
		if (!form.title.trim()) return;
		await onSubmit(form);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handleSubmit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "campaign-title",
					children: "Campaign name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "campaign-title",
					"data-testid": "campaign-title",
					value: form.title,
					onChange: (e) => set("title", e.target.value),
					placeholder: "Mother's Day EDM",
					autoFocus: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Channel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segment, {
					value: form.channel,
					onChange: (v) => {
						set("channel", v);
						if (!initial) set("sendTime", v === "SMS" ? "11:00" : "09:00");
					},
					options: [{
						value: "EDM",
						label: "EDM"
					}, {
						value: "SMS",
						label: "SMS"
					}]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "send-date",
						children: "Send date"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "send-date",
						type: "date",
						value: form.sendDate,
						onChange: (e) => set("sendDate", e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "send-time",
						children: "Send time"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "send-time",
						type: "time",
						value: form.sendTime,
						onChange: (e) => set("sendTime", e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Market" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segment, {
					value: form.market,
					onChange: (v) => set("market", v),
					options: [
						{
							value: "AU",
							label: "AU"
						},
						{
							value: "US",
							label: "US"
						},
						{
							value: "BOTH",
							label: "Both"
						}
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segment, {
					value: form.status,
					onChange: (v) => set("status", v),
					options: [
						{
							value: "draft",
							label: "Draft"
						},
						{
							value: "scheduled",
							label: "Scheduled"
						},
						{
							value: "sent",
							label: "Sent"
						}
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "subject",
					children: form.channel === "SMS" ? "SMS copy" : "Subject line"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "subject",
					value: form.subject,
					onChange: (e) => set("subject", e.target.value),
					placeholder: form.channel === "SMS" ? "Dad, this one's for you." : "Father's Day, sorted."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "audience",
					children: "Audience"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "audience",
					value: form.audience,
					onChange: (e) => set("audience", e.target.value),
					placeholder: "AU VIP · purchased 90d"
				})]
			}),
			dayDates.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "key-date",
					children: "Tied to"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					id: "key-date",
					value: form.keyDateId ?? "",
					onChange: (e) => set("keyDateId", e.target.value ? Number(e.target.value) : null),
					className: "flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "None"
					}), dayDates.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: k.id,
						children: k.name
					}, k.id))]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "notes",
					children: "Notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "notes",
					value: form.notes,
					onChange: (e) => set("notes", e.target.value),
					placeholder: "Offer, hero product, owner…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end",
				children: [onDelete ? confirmDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "danger",
					onClick: onDelete,
					disabled: pending,
					children: "Confirm delete"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					onClick: () => setConfirmDelete(true),
					children: "Delete"
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: pending || !form.title.trim(),
					"data-testid": "save-campaign",
					children: pending ? "Saving…" : initial ? "Save changes" : "Add campaign"
				})]
			})
		]
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2", "rounded-xl bg-surface p-5 text-ink shadow-[var(--shadow-border)]", "data-[state=open]:animate-in data-[state=closed]:animate-out", "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-sm p-2 text-muted hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1 pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-xl font-medium tracking-tight text-ink", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var tokenSchema = object({ token: string().optional() });
var channelSchema = _enum(["EDM", "SMS"]);
var marketSchema = _enum([
	"AU",
	"US",
	"BOTH"
]);
var statusSchema = _enum([
	"draft",
	"scheduled",
	"sent"
]);
var regionSchema = _enum([
	"AU",
	"US",
	"BOTH"
]);
var categorySchema = _enum([
	"public",
	"school",
	"retail",
	"cultural",
	"sporting"
]);
var campaignInput = object({
	token: string().optional(),
	title: string().trim().min(1).max(120),
	channel: channelSchema,
	sendDate: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	sendTime: string().max(8).optional().default(""),
	market: marketSchema,
	status: statusSchema,
	subject: string().max(200).optional().default(""),
	audience: string().max(120).optional().default(""),
	notes: string().max(2e3).optional().default(""),
	keyDateId: number().int().nullable().optional().default(null)
});
var unlockHint = createServerFn({ method: "POST" }).handler(createSsrRpc("ccfefeb42c7b2df259f7f00fa34faea9e72ff4235e4bdfa2d44c5ffa2a4fffc7"));
var checkSession = createServerFn({ method: "POST" }).validator(tokenSchema).handler(createSsrRpc("e87700c959c0f445f9a258333a7b2d0107d357be6440ab6ac971412719b83d8b"));
var login = createServerFn({ method: "POST" }).validator(object({ password: string().min(1) })).handler(createSsrRpc("eeacff82203dd0078b7c1ffa425abea96959211508b57065acc456c7ee0af58b"));
var logout = createServerFn({ method: "POST" }).handler(createSsrRpc("18edbd381f577a5f5756ea2e8690dd76ed31364d8bb2f79a073594a61ef84447"));
var changePassword = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	current: string().min(1),
	next: string().min(6).max(80)
})).handler(createSsrRpc("e8a2d874e4a3c876b2b385b836ca464074cf14f8246a18f08ff1d57e776d697b"));
var loadBoard = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	year: number().int()
})).handler(createSsrRpc("cc699db812cd28eada67a84d539842820d5132da9b4962f232a540507192230e"));
var createCampaign = createServerFn({ method: "POST" }).validator(campaignInput).handler(createSsrRpc("4d5adb4f418b9edc94212c453087864d07b829baa45b8e6a792af675e6abc5b0"));
var updateCampaign = createServerFn({ method: "POST" }).validator(campaignInput.extend({ id: number().int() })).handler(createSsrRpc("6c34141a67a2b14e429a2ee43a91a595eacf04a29ee098ff767644468ad6851e"));
var moveCampaign = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	id: number().int(),
	sendDate: string().regex(/^\d{4}-\d{2}-\d{2}$/)
})).handler(createSsrRpc("b27431f510b1160bf38e37bff8630c095d9e01861c69f7b874fcf69cebaf845a"));
var deleteCampaign = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	id: number().int()
})).handler(createSsrRpc("e046b6893b61b16dac5cd631d14bb46eb3f484eefea2756cd0e93752bb0fdfc4"));
var createKeyDate = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	name: string().trim().min(1).max(120),
	startDate: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
	region: regionSchema,
	category: categorySchema,
	notes: string().max(500).optional().default("")
})).handler(createSsrRpc("28d7648d2151609d724d2010f61e50388ab68002e0afe66ccc1941815a33886c"));
var deleteKeyDate = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	id: number().int()
})).handler(createSsrRpc("bc68a4b05c540ffaa718a08dbdf74fd5d2ff7c9bf105472a76c03abfce6576c0"));
function SettingsDialog({ open, onOpenChange, token, defaultDate, defaultTab = "password", onKeyDateCreated }) {
	const [tab, setTab] = (0, import_react.useState)(defaultTab);
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [pwMsg, setPwMsg] = (0, import_react.useState)("");
	const [pwErr, setPwErr] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [start, setStart] = (0, import_react.useState)(defaultDate);
	const [end, setEnd] = (0, import_react.useState)("");
	const [region, setRegion] = (0, import_react.useState)("AU");
	const [category, setCategory] = (0, import_react.useState)("retail");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [dateMsg, setDateMsg] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (open) {
			setTab(defaultTab);
			setStart(defaultDate);
		}
	}, [
		open,
		defaultTab,
		defaultDate
	]);
	async function savePassword(e) {
		e.preventDefault();
		setPending(true);
		setPwErr("");
		setPwMsg("");
		try {
			await changePassword({ data: {
				token,
				current,
				next
			} });
			setPwMsg("Password updated.");
			setCurrent("");
			setNext("");
		} catch (err) {
			setPwErr(err instanceof Error ? err.message : "Could not update password");
		} finally {
			setPending(false);
		}
	}
	async function saveDate(e) {
		e.preventDefault();
		setPending(true);
		setDateMsg("");
		try {
			await createKeyDate({ data: {
				token,
				name,
				startDate: start,
				endDate: end || null,
				region,
				category,
				notes
			} });
			setDateMsg("Date added to the calendar.");
			setName("");
			setNotes("");
			onKeyDateCreated();
		} catch (err) {
			setDateMsg(err instanceof Error ? err.message : "Could not add date");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Settings" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Team password and custom dates the whole calendar can plan around." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex rounded-md bg-surface-2 p-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab("password"),
					className: `h-9 flex-1 rounded-sm text-sm font-medium ${tab === "password" ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted"}`,
					children: "Password"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab("date"),
					className: `h-9 flex-1 rounded-sm text-sm font-medium ${tab === "date" ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted"}`,
					children: "Custom date"
				})]
			}),
			tab === "password" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: savePassword,
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "current-pw",
							children: "Current password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "current-pw",
							type: "password",
							value: current,
							onChange: (e) => setCurrent(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "next-pw",
							children: "New password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "next-pw",
							type: "password",
							value: next,
							onChange: (e) => setNext(e.target.value),
							minLength: 6
						})]
					}),
					pwErr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: pwErr
					}) : null,
					pwMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-accent",
						children: pwMsg
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: pending || !current || next.length < 6,
						children: pending ? "Saving…" : "Update password"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: saveDate,
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "kd-name",
							children: "Name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "kd-name",
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Collagen bar launch"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "kd-start",
								children: "Start"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "kd-start",
								type: "date",
								value: start,
								onChange: (e) => setStart(e.target.value)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "kd-end",
								children: "End (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "kd-end",
								type: "date",
								value: end,
								onChange: (e) => setEnd(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "kd-region",
								children: "Market"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "kd-region",
								value: region,
								onChange: (e) => setRegion(e.target.value),
								className: "flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "AU",
										children: "AU"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "US",
										children: "US"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "BOTH",
										children: "Both"
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "kd-cat",
								children: "Type"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "kd-cat",
								value: category,
								onChange: (e) => setCategory(e.target.value),
								className: "flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "retail",
										children: "Retail / campaign"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "cultural",
										children: "Cultural"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "sporting",
										children: "Sporting"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "school",
										children: "School"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "public",
										children: "Public holiday"
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "kd-notes",
							children: "Notes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "kd-notes",
							value: notes,
							onChange: (e) => setNotes(e.target.value),
							placeholder: "Why this matters for Chief"
						})]
					}),
					dateMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-accent",
						children: dateMsg
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: pending || !name.trim(),
						children: pending ? "Saving…" : "Add key date"
					})
				]
			})
		] })
	});
}
var TOKEN_STORAGE_KEY = "chief_cal_token";
function FilterPill({ value, current, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: () => onClick(value),
		className: cn("h-11 rounded-full px-3.5 text-xs font-medium transition-colors duration-150", value === current ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-ink"),
		children
	});
}
function CalendarApp({ token, onLock }) {
	const [month, setMonth] = (0, import_react.useState)(() => startOfMonth(/* @__PURE__ */ new Date()));
	const [keyDates, setKeyDates] = (0, import_react.useState)([]);
	const [campaigns, setCampaigns] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [region, setRegion] = (0, import_react.useState)("ALL");
	const [channel, setChannel] = (0, import_react.useState)("ALL");
	const [showKeyDates, setShowKeyDates] = (0, import_react.useState)(true);
	const [showSchool, setShowSchool] = (0, import_react.useState)(true);
	const [view, setView] = (0, import_react.useState)("month");
	const [selectedDate, setSelectedDate] = (0, import_react.useState)(todayISO());
	const [dayOpen, setDayOpen] = (0, import_react.useState)(false);
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [formDate, setFormDate] = (0, import_react.useState)(todayISO());
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [settingsTab, setSettingsTab] = (0, import_react.useState)("password");
	const [settingsTabDate, setSettingsTabDate] = (0, import_react.useState)(todayISO());
	const [saving, setSaving] = (0, import_react.useState)(false);
	const year = month.getFullYear();
	const dialogOpen = dayOpen || formOpen || settingsOpen;
	const refresh = (0, import_react.useCallback)(async () => {
		const data = await loadBoard({ data: {
			token,
			year
		} });
		setKeyDates(data.keyDates);
		setCampaigns(data.campaigns);
		setLoading(false);
	}, [token, year]);
	(0, import_react.useEffect)(() => {
		setLoading(true);
		refresh().catch(() => {
			toast.error("Could not load the calendar.");
			setLoading(false);
		});
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (dialogOpen) return;
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
			if (e.key === "ArrowRight") setMonth((m) => addMonths(m, 1));
			if (e.key === "ArrowLeft") setMonth((m) => addMonths(m, -1));
			if (e.key === "t") {
				const now = startOfMonth(/* @__PURE__ */ new Date());
				setMonth(now);
				setSelectedDate(todayISO());
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [dialogOpen]);
	function openDay(iso) {
		setSelectedDate(iso);
		setDayOpen(true);
		const d = fromISO(iso);
		if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) setMonth(startOfMonth(d));
	}
	function openCreate(iso) {
		setEditing(null);
		setFormDate(iso);
		setFormOpen(true);
	}
	function openEdit(c) {
		setEditing(c);
		setFormDate(c.sendDate);
		setFormOpen(true);
	}
	async function saveCampaign(input) {
		setSaving(true);
		try {
			if (editing) {
				await updateCampaign({ data: {
					token,
					id: editing.id,
					...input
				} });
				toast.success("Campaign updated.");
			} else {
				await createCampaign({ data: {
					token,
					...input
				} });
				toast.success("Campaign added.");
			}
			setFormOpen(false);
			setEditing(null);
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save campaign");
		} finally {
			setSaving(false);
		}
	}
	async function removeCampaign() {
		if (!editing) return;
		setSaving(true);
		try {
			await deleteCampaign({ data: {
				token,
				id: editing.id
			} });
			toast.success("Campaign removed.");
			setFormOpen(false);
			setEditing(null);
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not delete");
		} finally {
			setSaving(false);
		}
	}
	async function handleMove(c, sendDate) {
		if (c.sendDate === sendDate) return;
		setCampaigns((prev) => prev.map((x) => x.id === c.id ? {
			...x,
			sendDate
		} : x));
		try {
			await moveCampaign({ data: {
				token,
				id: c.id,
				sendDate
			} });
			toast.success(`Moved to ${formatDayMonth(sendDate)}.`);
		} catch {
			toast.error("Could not move campaign");
			await refresh();
		}
	}
	async function removeKeyDate(id) {
		try {
			await deleteKeyDate({ data: {
				token,
				id
			} });
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not remove date");
		}
	}
	async function lock() {
		try {
			await logout();
		} catch {}
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		onLock();
	}
	function jumpYear(y) {
		const now = /* @__PURE__ */ new Date();
		if (y === now.getFullYear()) {
			setMonth(startOfMonth(now));
			setSelectedDate(todayISO());
		} else setMonth(new Date(y, month.getMonth(), 1));
	}
	const monthStart = toISO(month);
	const monthEnd = toISO(new Date(year, month.getMonth() + 1, 0));
	const agendaItems = (0, import_react.useMemo)(() => {
		const items = [];
		for (const c of campaigns) {
			if (c.sendDate < monthStart || c.sendDate > monthEnd) continue;
			if (channel !== "ALL" && c.channel !== channel) continue;
			if (region !== "ALL" && c.market !== region && c.market !== "BOTH") continue;
			items.push({
				kind: "campaign",
				date: c.sendDate,
				campaign: c
			});
		}
		if (showKeyDates) for (const k of keyDates) {
			if (k.startDate < monthStart || k.startDate > monthEnd) continue;
			if (region !== "ALL" && k.region !== region && k.region !== "BOTH") continue;
			if (!showSchool && k.category === "school") continue;
			items.push({
				kind: "key",
				date: k.startDate,
				keyDate: k
			});
		}
		items.sort((a, b) => a.date.localeCompare(b.date));
		return items;
	}, [
		campaigns,
		keyDates,
		monthStart,
		monthEnd,
		channel,
		region,
		showKeyDates,
		showSchool
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-line bg-surface/80 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 md:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { className: "shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => openCreate(selectedDate ?? todayISO()),
								"data-testid": "add-campaign",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden sm:inline",
									children: "Campaign"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: () => {
									setSettingsTab("password");
									setSettingsTabDate(selectedDate ?? todayISO());
									setSettingsOpen(true);
								},
								"aria-label": "Settings",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								onClick: lock,
								"aria-label": "Lock",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" })
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_280px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										onClick: () => setMonth((m) => addMonths(m, -1)),
										"aria-label": "Previous month",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "min-w-[12ch] text-center font-display text-2xl font-medium tracking-tight md:text-3xl",
										children: monthTitle(month)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										onClick: () => setMonth((m) => addMonths(m, 1)),
										"aria-label": "Next month",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										className: "ml-1",
										onClick: () => {
											setMonth(startOfMonth(/* @__PURE__ */ new Date()));
											setSelectedDate(todayISO());
										},
										children: "Today"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex rounded-md bg-surface-2 p-1",
									children: [2026, 2027].map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => jumpYear(y),
										className: cn("h-9 rounded-sm px-3 text-xs font-medium", year === y ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted"),
										children: y
									}, y))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex rounded-md bg-surface-2 p-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setView("month"),
										className: cn("h-9 rounded-sm px-3 text-xs font-medium", view === "month" ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted"),
										children: "Month"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setView("agenda"),
										className: cn("h-9 rounded-sm px-3 text-xs font-medium", view === "agenda" ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted"),
										children: "Agenda"
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
									value: "ALL",
									current: region,
									onClick: setRegion,
									children: "AU + US"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
									value: "AU",
									current: region,
									onClick: setRegion,
									children: "AU"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
									value: "US",
									current: region,
									onClick: setRegion,
									children: "US"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-4 w-px bg-line" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
									value: "ALL",
									current: channel,
									onClick: setChannel,
									children: "All channels"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
									value: "EDM",
									current: channel,
									onClick: setChannel,
									children: "EDM"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterPill, {
									value: "SMS",
									current: channel,
									onClick: setChannel,
									children: "SMS"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mx-1 h-4 w-px bg-line" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowKeyDates((v) => !v),
									className: cn("h-11 rounded-full px-3.5 text-xs font-medium", showKeyDates ? "bg-surface-2 text-ink" : "bg-transparent text-subtle line-through"),
									children: "Key dates"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowSchool((v) => !v),
									className: cn("h-11 rounded-full px-3.5 text-xs font-medium", showSchool ? "bg-surface-2 text-ink" : "bg-transparent text-subtle line-through"),
									children: "School holidays"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[420px] animate-pulse rounded-xl bg-surface-2" }) : view === "month" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthGrid, {
								year,
								monthIndex: month.getMonth(),
								keyDates,
								campaigns,
								region,
								channel,
								showKeyDates,
								showSchool,
								selectedDate,
								onSelectDate: openDay,
								onEditCampaign: openEdit,
								onMoveCampaign: handleMove
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] md:p-6",
								children: agendaItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [
										"Nothing in ",
										monthTitle(month),
										" for these filters."
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
									className: "divide-y divide-line",
									children: agendaItems.map((item) => item.kind === "campaign" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => openEdit(item.campaign),
										className: "flex w-full items-start gap-4 py-3 text-left hover:bg-bg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-16 shrink-0 text-xs tabular-nums text-muted",
												children: item.date.slice(8)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("mt-0.5 rounded-full px-2 py-0.5 text-2xs font-medium", item.campaign.channel === "EDM" ? "bg-accent text-accent-fg" : "bg-clay text-clay-fg"),
												children: item.campaign.channel
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-sm font-medium",
													children: item.campaign.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs text-muted",
													children: [
														item.campaign.market,
														" · ",
														item.campaign.status,
														item.campaign.subject ? ` · ${item.campaign.subject}` : ""
													]
												})]
											})
										]
									}) }, `c-${item.campaign.id}`) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => openDay(item.date),
										className: "flex w-full items-start gap-4 py-3 text-left hover:bg-bg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-16 shrink-0 text-xs tabular-nums text-muted",
												children: item.date.slice(8)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-0.5 text-2xs tracking-wide text-muted uppercase",
												children: "Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block text-sm italic",
													children: item.keyDate.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted",
													children: item.keyDate.region === "BOTH" ? "AU + US" : item.keyDate.region
												})]
											})
										]
									}) }, `k-${item.keyDate.id}`))
								})
							})
						}),
						view === "month" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-subtle",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-xs bg-accent" }), " EDM"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-xs bg-clay" }), " SMS"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-xs bg-school" }), " School holidays"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Drag a campaign to another day to reschedule. AU school dates follow NSW." })
							]
						}) : null
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upcoming, {
							keyDates,
							campaigns,
							region,
							channel,
							showKeyDates,
							onOpenDate: openDay
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upcoming, {
							keyDates,
							campaigns,
							region,
							channel,
							showKeyDates,
							onOpenDate: openDay
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: dayOpen,
				onOpenChange: setDayOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[min(90dvh,720px)] overflow-y-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						className: "sr-only",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: selectedDate ? formatLong(selectedDate) : "Day" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Key dates and campaigns for this day." })]
					}), selectedDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayPanel, {
						date: selectedDate,
						keyDates,
						campaigns,
						onAdd: () => {
							setDayOpen(false);
							openCreate(selectedDate);
						},
						onEdit: (c) => {
							setDayOpen(false);
							openEdit(c);
						},
						onAddKeyDate: () => {
							setDayOpen(false);
							setSettingsTab("date");
							setSettingsTabDate(selectedDate);
							setSettingsOpen(true);
						},
						onDeleteKeyDate: removeKeyDate
					}) : null]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: formOpen,
				onOpenChange: setFormOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[min(90dvh,760px)] overflow-y-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Edit campaign" : "New campaign" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: editing ? "Update this EDM or SMS." : `Sending ${formatLong(formDate)}.` })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignForm, {
						initial: editing ?? void 0,
						date: formDate,
						keyDates,
						pending: saving,
						onSubmit: saveCampaign,
						onDelete: editing ? removeCampaign : void 0
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsDialog, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen,
				token,
				defaultDate: settingsTabDate,
				defaultTab: settingsTab,
				onKeyDateCreated: refresh
			})
		]
	});
}
function BootScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center bg-bg px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
	});
}
function LockScreen({ onUnlock }) {
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [starter, setStarter] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		unlockHint().then((res) => {
			if (!cancelled) setStarter(res.starter);
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);
	async function onSubmit(e) {
		e.preventDefault();
		setPending(true);
		setError("");
		try {
			const result = await login({ data: { password } });
			localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
			onUnlock(result.token);
		} catch {
			setError("Wrong password. Try again.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex min-h-dvh flex-col items-center justify-center px-5 py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": true,
			className: "pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_6%,transparent),transparent)]"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm rounded-2xl bg-surface p-8 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-8 font-display text-3xl leading-tight font-medium tracking-tight text-ink",
					children: "Team calendar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "EDM and SMS planning for Australia and the US, with the dates worth building campaigns around."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit,
					className: "mt-8 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "team-password",
								children: "Team password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "team-password",
								"data-testid": "team-password",
								type: "password",
								autoComplete: "current-password",
								autoFocus: true,
								value: password,
								onChange: (e) => setPassword(e.target.value),
								placeholder: "Enter password"
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "w-full",
							disabled: pending || !password,
							children: pending ? "Unlocking…" : "Unlock"
						})
					]
				}),
				starter ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 rounded-md bg-bg px-3 py-2.5 text-xs leading-relaxed text-muted",
					children: [
						"Starter password is",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium tracking-wide text-ink",
							children: starter
						}),
						". Change it in Settings once you are in."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-xs leading-relaxed text-subtle",
					children: "Shared with the Chief marketing team. Ask whoever last changed it if you are stuck."
				})
			]
		})]
	});
}
function Home() {
	const [gate, setGate] = (0, import_react.useState)({ status: "boot" });
	(0, import_react.useEffect)(() => {
		const stored = localStorage.getItem("chief_cal_token") ?? "";
		if (!stored) {
			setGate({ status: "locked" });
			return;
		}
		let cancelled = false;
		checkSession({ data: { token: stored } }).then((res) => {
			if (cancelled) return;
			setGate(res.ok ? {
				status: "open",
				token: stored
			} : { status: "locked" });
		}).catch(() => {
			if (!cancelled) setGate({ status: "locked" });
		});
		return () => {
			cancelled = true;
		};
	}, []);
	if (gate.status === "boot") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (gate.status === "locked") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockScreen, { onUnlock: (token) => setGate({
		status: "open",
		token
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarApp, {
		token: gate.token,
		onLock: () => setGate({ status: "locked" })
	});
}
//#endregion
export { Home as component };
