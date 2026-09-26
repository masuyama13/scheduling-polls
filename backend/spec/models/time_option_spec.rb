require "rails_helper"

RSpec.describe TimeOption, type: :model do
  it "rejects duplicate times within the same event" do
    event = create(:event)
    starts_at = 1.day.from_now
    create(:time_option, event: event, starts_at: starts_at)
    duplicate = build(:time_option, event: event, starts_at: starts_at)

    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:starts_at]).to include("has already been taken")
  end

  it "allows the same time in different events" do
    starts_at = 1.day.from_now

    first = build(:time_option, event: create(:event), starts_at: starts_at)
    second = build(:time_option, event: create(:event), starts_at: starts_at)

    expect(first).to be_valid
    expect(second).to be_valid
  end
end
